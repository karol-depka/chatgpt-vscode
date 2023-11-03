#!/bin/bash
set -x

cat hello.patch

echo
echo ========= 
echo

# patch -l hello.ts < hello.patch
# patch hello.ts < hello.patch

ts-node apply_patch.ts

ts-node hello.ts.applied.ts