---
name: incus-colima
description: Build Incus from source and drive the `coi` Colima VM that runs incusd on this Mac. Use when building Incus, creating or repairing the Colima incus runtime, fixing client/server version skew, or making instances reachable from macOS.
---

# Incus on macOS via Colima

macOS cannot run `incusd` — it is Linux-only. This machine splits the work:

| Piece | Where | Built/installed by |
|---|---|---|
| `incus` client | macOS, `~/go/bin/incus` | `make client` from source |
| `incusd` server | Colima VM `coi` | zabbly apt packages |
| full server build | throwaway Incus container | `make` (see `building.md`) |

Source checkout: `~/Develop/incus`.

## Quick status check

```bash
incus version                      # client (macOS) vs server (VM)
colima list                        # coi should be Running, runtime=incus
incus storage list                 # default pool, zfs driver
incus network show incusbr0        # must NOT collide with en0's subnet
```

## Building

`make client` is the only target that works on macOS — `make build` needs cowsql
headers that do not exist here, and the Makefile hard-fails without them:

```bash
cd ~/Develop/incus && make client   # ~15s, installs to ~/go/bin/incus
```

The client links no C libraries, which is why this works. For a full server
build (`incusd` and friends) see `building.md` — it runs inside a container.

## Creating the VM

```bash
colima start coi --runtime incus \
    --cpu 8 --memory 16 --disk 200 \
    --nested-virtualization --vm-type vz
```

Colima provisions ZFS and runs `incus admin init` itself. Do not run
`incus admin init` afterwards. See `vm-setup.md` for what it creates and the two
gotchas that bite every time.

## Networking

Instances are not reachable from macOS by default. One static route fixes it for
every instance and port. See `networking.md`.

## Reference files

- `vm-setup.md` — VM creation, what Colima provisions, subnet + apt-hold gotchas
- `building.md` — full Linux build inside a container, cowsql/raft handling
- `networking.md` — route LaunchDaemon vs proxy devices
