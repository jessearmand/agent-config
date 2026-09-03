# Colima VM `coi` — provisioning and gotchas

## Create

```bash
colima start coi --runtime incus \
    --cpu 8 --memory 16 --disk 200 \
    --nested-virtualization --vm-type vz
```

`--nested-virtualization` requires Apple silicon M3 or newer with `--vm-type vz`.
Without it `incus launch --vm` fails; system containers still work.

Config lands in `~/.colima/coi/colima.yaml`; the Lima instance is `colima-coi`.

## What Colima provisions for you

Do **not** run `incus admin init` — Colima already did:

- storage pool `default`, driver **zfs**, file-backed at
  `/var/lib/incus/disks/default.img` on the 200 GB data disk (`/dev/vdb1`, ext4)
- `zfsutils-linux` installed with `zfs-kmod` loaded
- network `incusbr0`
- `default` profile wired to both
- incus remote `colima-coi` on the macOS side, via a forwarded unix socket at
  `~/.colima/coi/incus.sock`

Verify with `incus storage list`, `incus network list`, `incus profile show default`.

## Gotcha 1 — `incusbr0` can collide with the LAN

Colima assigned `incusbr0` **192.168.100.1/24**, which is this machine's actual
LAN (`en0` is 192.168.100.x, and .1 is the router). Colima detects it, refuses to
add its host route, and logs:

```
warning: subnet 192.168.100.0/24 conflicts with host network, skipping route setup
```

Left alone, instances get addresses that collide with the LAN and their traffic
to real LAN hosts is misrouted to the bridge. Fix before launching anything:

```bash
incus network set incusbr0 ipv4.address=10.181.0.1/24
```

Trivial with zero instances; migrating later means renumbering everything.
Check the host's own subnet first with `ifconfig en0 | grep 'inet '`.

## Gotcha 2 — Colima apt-holds the incus packages

Colima pins its provisioned runtime, so a plain `apt install incus` fails with
"held broken packages". Held: `incus`, `incus-base`, `incus-client`,
`incus-extra`, `incus-ui-canonical`, plus `zfsutils-linux`, `lvm2`,
`btrfs-progs`.

To upgrade the server (e.g. to match a newer client), unhold only the incus five,
upgrade, then re-hold to preserve Colima's convention. Leave the storage packages
held:

```bash
colima ssh -p coi -- sudo sh -c '
  PKGS="incus incus-base incus-client incus-extra incus-ui-canonical"
  apt-mark unhold $PKGS
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y $PKGS
  apt-mark hold $PKGS'
```

Instances keep running across the daemon restart.

## Version skew

Client and server need **not** match — Incus negotiates by API extension, not
version. A newer client against an older server works for everything except the
extensions the server lacks, and fails loudly when you hit one:

```
Error: Invalid option for network "incusbr0" option "dns.include_hosts"
```

Measure the real gap rather than guessing from version numbers:

```bash
cd ~/Develop/incus
incus query /1.0 > /tmp/srv.json
python3 - <<'PY'
import json, re
srv = set(json.load(open("/tmp/srv.json")).get("api_extensions") or [])
cli = set(re.findall(r'"([a-z0-9_]+)"', open("internal/version/api.go").read()))
print("server lacks:", sorted(cli - srv))
PY
```

A gap of only unreleased-in-tree extensions is expected when the client is built
from `main`.

## VM interfaces

```
eth0   192.168.5.1/24    user-v2 userspace netstack (default route, DNS)
col0   192.168.64.2/24   vmnet — reachable from macOS, this is the useful one
```

Note the `default` Colima profile uses **only** user-v2 and is not host-reachable;
do not generalise its config to `coi`.
