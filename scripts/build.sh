#!/bin/bash

set -euo pipefail
cd "$(dirname "$0")/.."

VERSION=$(jq -r .version < package.json)

docker build . -t "rhtodo:$VERSION"
