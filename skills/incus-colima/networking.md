# Reaching instances from macOS

Instances live behind `incusbr0` inside the VM. Lima discovers forwardable ports
by watching `/proc/net/tcp` in the VM's **host** netns, so a container's
listeners — in their own netns behind the bridge — are invisible to it and never
auto-forward.

Two ways to bridge the gap. They are not really competing: a proxy device is
*port publishing*, a route is *network reachability*.

|  | `incus proxy` device | static route |
|---|---|---|
| scope | one instance, one port | all instances, all ports |
| per new service / instance | add a device each time | nothing |
| survives instance rebuild | no (unless in a profile) | yes |
| real instance IP | no — relayed, appears local | yes |
| ping / ICMP / other protocols | no | yes |
| needs sudo | no | yes, once |
| survives macOS reboot | yes | only via LaunchDaemon |

Proxy devices are O(services) config living inside instance definitions, so they
accumulate and drift, ports must be deconflicted by hand, and because the relay
rewrites the source address they quietly break IP-based auth, rate limiting and
logging. Prefer the route; keep proxy devices for when you specifically want a
stable `localhost:PORT` that survives VM address changes.

```bash
# proxy device, when you do want one
incus config device add INSTANCE web proxy \
    listen=tcp:0.0.0.0:8080 connect=tcp:127.0.0.1:80
```

## The route

The VM is reachable on its vmnet interface (`col0`, 192.168.64.x). One route
makes every instance directly addressable:

```bash
sudo route -n add -net 10.181.0.0/24 192.168.64.2
```

This only works once `incusbr0` is off a subnet that collides with the LAN — see
gotcha 1 in `vm-setup.md`. That collision is exactly why Colima skips its own
route setup.

## Persistent version

`incus-route.sh` + `com.local.incus-route.plist`, both in this skill directory
(canonical copies; `~/.local/share/incus-route/` holds a duplicate), install it
as a LaunchDaemon. `$SKILL` below is this directory.

```bash
sudo mkdir -p /usr/local/sbin && \
sudo install -m 755 -o root -g wheel $SKILL/incus-route.sh \
     /usr/local/sbin/incus-route.sh && \
sudo install -m 644 -o root -g wheel $SKILL/com.local.incus-route.plist \
     /Library/LaunchDaemons/com.local.incus-route.plist && \
sudo launchctl bootstrap system /Library/LaunchDaemons/com.local.incus-route.plist
```

Verify: `netstat -rn -f inet | grep 10.181.0`, `cat /var/log/incus-route.log`.
Remove: `sudo launchctl bootout system/com.local.incus-route`, then delete both files.

Three design points worth preserving if you edit it:

1. **Discover the VM address by lease name, not a hardcoded IP.** macOS records
   the vmnet lease in `/var/db/dhcpd_leases` keyed by `name=lima-colima-coi`, so
   recreating the VM self-heals. That file is root-readable at boot with no
   dependency on `$HOME` or the `colima` CLI — neither of which a LaunchDaemon has.
2. **Require the gateway to resolve to a `bridge*` interface.** The vmnet bridge
   only exists while the VM runs; otherwise `route get` falls back to the default
   route via `en0` and would point the instance subnet at the LAN router.
3. **Only withdraw a route whose gateway matches the lease address** — never
   remove a route for that subnet that something else installed.

`RunAtLoad` plus `StartInterval 60`, not `KeepAlive`: at boot the VM is not up
yet, so a one-shot would simply fail. The script exits silently when there is
nothing to do.
