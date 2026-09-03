#!/bin/sh
# Keep a static route to the Incus bridge subnet inside a Colima VM.
#
# Colima's VM sits on the vmnet bridge (192.168.64.0/24) and is reachable from
# macOS, but instances live behind incusbr0 inside the VM. One route makes every
# instance directly addressable -- no per-service proxy devices.
#
# Installed as a LaunchDaemon; runs at boot and every StartInterval seconds.
# Idempotent: silent when the route is already correct.

set -u

SUBNET="10.181.0.0"
NETMASK="255.255.255.0"
PREFIX="24"
LEASE_NAME="lima-colima-coi"      # Colima/Lima registers this in the vmnet lease db
LEASES="/var/db/dhcpd_leases"

log() { printf '%s incus-route: %s\n' "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$*"; }

# --- 1. Find the VM's vmnet address ---------------------------------------
# Looked up by lease *name*, not a hardcoded IP, so recreating the VM (which can
# change its address) does not break the route.
[ -r "$LEASES" ] || { log "no $LEASES; nothing to do"; exit 0; }

GW=$(awk -v want="$LEASE_NAME" '
    /^{/          { name=""; ip="" }
    /name=/       { line=$0; sub(/^[ \t]*name=/, "", line); name=line }
    /ip_address=/ { line=$0; sub(/^[ \t]*ip_address=/, "", line); ip=line }
    /^}/          { if (name == want && ip != "") { print ip; exit } }
' "$LEASES")

[ -n "$GW" ] || { log "no lease for $LEASE_NAME; VM never started"; exit 0; }

# --- 2. What route is installed right now? --------------------------------
NET_SHORT=$(echo "$SUBNET" | sed 's/\.0$//')          # 10.181.0.0 -> 10.181.0
CURRENT=$(netstat -rn -f inet 2>/dev/null | awk -v a="$NET_SHORT" -v b="$SUBNET/$PREFIX" \
    '$1 == a || $1 == b { print $2; exit }')

# --- 3. Is the gateway on-link? -------------------------------------------
# The vmnet bridge only exists while the VM runs. If it is gone, "route get"
# falls back to the default route via en0 -- which would be wrong. Require the
# resolved interface to be a bridge.
IFACE=$(route -n get "$GW" 2>/dev/null | awk '/interface:/ { print $2 }')

case "$IFACE" in
    bridge*)
        ;;
    *)
        # VM is down. Withdraw the route so the table stays clean -- but only if
        # it is ours (gateway matches the lease address). Never remove a route
        # someone or something else installed for this subnet.
        if [ -n "$CURRENT" ] && [ "$CURRENT" = "$GW" ]; then
            if route -n delete -net "$SUBNET" -netmask "$NETMASK" >/dev/null 2>&1; then
                log "VM down; withdrew $SUBNET/$PREFIX via $GW"
            else
                log "VM down; FAILED to withdraw $SUBNET/$PREFIX via $GW"
            fi
        fi
        exit 0
        ;;
esac

# --- 4. Install or repair -------------------------------------------------
[ "$CURRENT" = "$GW" ] && exit 0                      # already correct; stay quiet

if [ -n "$CURRENT" ]; then
    log "route points at $CURRENT, want $GW; replacing"
    route -n delete -net "$SUBNET" -netmask "$NETMASK" >/dev/null 2>&1
fi

if route -n add -net "$SUBNET" -netmask "$NETMASK" "$GW" >/dev/null 2>&1; then
    log "added $SUBNET/$PREFIX via $GW ($IFACE)"
else
    log "FAILED to add $SUBNET/$PREFIX via $GW"
    exit 1
fi
