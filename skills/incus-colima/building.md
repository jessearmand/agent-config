# Building Incus

## macOS — client only

```bash
cd ~/Develop/incus && make client      # ~15s -> ~/go/bin/incus
```

`make build` cannot work here. The Makefile probes for cowsql by *compiling* a
test program against `cowsql.h`:

```make
TAG_SQLITE3=$(shell printf "#include <cowsql.h>\nvoid main(){cowsql_node_id n = 1;}" \
    | $(CC) -o /dev/null -xc - >/dev/null 2>&1 && echo "libsqlite3")
```

No header, no tag, and `build` hard-fails while `client` proceeds — `./cmd/incus`
has no cowsql dependency. Confirm with `ldd`/`otool`: the client links neither
cowsql nor raft. Only `incusd` does.

Requires Go >= the `go` directive in `go.mod`. System Go is at `/usr/local/go`.

## Linux — full build inside a container

Keeps the VM clean and exercises the runtime end to end.

```bash
incus launch images:ubuntu/24.04 incus-build

# ship the tree, not the repo: git archive is ~25 MB vs ~228 MB with .git,
# and the version string lives in internal/version/flex.go, in-tree.
cd ~/Develop/incus
git archive --format=tar --prefix=incus/ HEAD -o /tmp/incus-src.tar
incus file push /tmp/incus-src.tar incus-build/root/incus-src.tar
incus file push build-incus.sh      incus-build/root/build-incus.sh

incus exec incus-build -- bash /root/build-incus.sh
```

`build-incus.sh` lives beside this file. Stages: apt deps → Go → unpack →
`make deps` → `make`. Budget several minutes for `make deps`, which compiles
raft and cowsql from source.

Do **not** build over the virtiofs `$HOME` mount: CGO builds thrash the
filesystem and scatter artifacts through the working copy.

## The cowsql linkage trap

`make deps` does not install libraries system-wide. It drops them in
`$GOPATH/deps/{raft,cowsql}` and merely *prints* the environment you must export:

```bash
export CGO_CFLAGS="-I$GOPATH/deps/raft/include/ -I$GOPATH/deps/cowsql/include/"
export CGO_LDFLAGS="-L$GOPATH/deps/raft/.libs -L$GOPATH/deps/cowsql/.libs/"
export LD_LIBRARY_PATH="$GOPATH/deps/raft/.libs/:$GOPATH/deps/cowsql/.libs/"
export CGO_LDFLAGS_ALLOW="(-Wl,-wrap,pthread_create)|(-Wl,-z,now)"
```

Miss these and `make` fails with opaque linker errors. `CGO_LDFLAGS_ALLOW` is
mandatory — Go rejects unrecognised linker flags, and cowsql needs `-Wl,-wrap`.

The same applies at **run** time. A locally built `incusd` is dynamically linked
against those `.so` files:

```
$ /root/go/bin/incusd --version
error while loading shared libraries: libcowsql.so.0: cannot open shared object file
```

Set `LD_LIBRARY_PATH` to run it. This never affects the packaged server: zabbly
ships everything self-contained under `/opt/incus/lib/` (libcowsql, libraft,
liblxc, libtpms, liburing, libnvidia-container), wired up by dpkg.

## Running your own build as the VM's daemon

Possible but off the supported path: you must also install the raft/cowsql
libraries into the VM and set `LD_LIBRARY_PATH` in the systemd unit, and Colima
upgrades will clobber it. Prefer upgrading the zabbly package (see
`vm-setup.md`) unless testing unmerged changes.
