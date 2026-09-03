#!/bin/bash
# Build Incus from source inside a Linux (incus) container.
# Expects /root/incus-src.tar to already be pushed in.
set -euo pipefail

GO_VERSION="1.27.1"
ARCH="$(dpkg --print-architecture)"   # arm64 here
SRC="/root/incus"

echo "==> 1/5 apt dependencies"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
# Build deps for raft + cowsql (make deps) and for incusd itself (liblxc, acl, cap).
apt-get install -y --no-install-recommends \
    autoconf automake libtool make pkg-config gcc git ca-certificates curl xz-utils \
    libuv1-dev libudev-dev liblz4-dev libsqlite3-dev \
    libacl1-dev libcap-dev liblxc-dev \
    gettext tcl >/dev/null
echo "    ok"

echo "==> 2/5 Go ${GO_VERSION}"
if [ ! -x /usr/local/go/bin/go ]; then
    curl -fsSL "https://go.dev/dl/go${GO_VERSION}.linux-${ARCH}.tar.gz" -o /tmp/go.tgz
    rm -rf /usr/local/go
    tar -C /usr/local -xzf /tmp/go.tgz
    rm -f /tmp/go.tgz
fi
export PATH="/usr/local/go/bin:/root/go/bin:$PATH"
go version

echo "==> 3/5 unpack source"
rm -rf "$SRC"
mkdir -p /root && tar -C /root -xf /root/incus-src.tar
cd "$SRC"
echo "    version in tree: $(grep 'var Version' internal/version/flex.go | cut -d'\"' -f2)"

echo "==> 4/5 make deps  (builds raft + cowsql from source — slowest step)"
make deps

# Paths that 'make deps' prints at the end; GOPATH defaults to /root/go.
GOPATH="$(go env GOPATH)"
export CGO_CFLAGS="-I${GOPATH}/deps/raft/include/ -I${GOPATH}/deps/cowsql/include/"
export CGO_LDFLAGS="-L${GOPATH}/deps/raft/.libs -L${GOPATH}/deps/cowsql/.libs/"
export LD_LIBRARY_PATH="${GOPATH}/deps/raft/.libs/:${GOPATH}/deps/cowsql/.libs/"
export CGO_LDFLAGS_ALLOW="(-Wl,-wrap,pthread_create)|(-Wl,-z,now)"

echo "==> 5/5 make build"
make

echo
echo "==> built binaries:"
ls -la "${GOPATH}/bin/"
echo
"${GOPATH}/bin/incusd" --version 2>/dev/null || true
