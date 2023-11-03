#!/bin/bash

set -x
# patch -l hello.ts < hello.patch
patch hello.ts < hello.patch

tsc hello.ts