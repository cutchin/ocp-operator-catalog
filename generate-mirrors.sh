#!/bin/bash

VERSIONS="4.7 4.10"
CATALOGS="redhat-operator-index certified-operator-index redhat-marketplace-index community-operator-index"

mkdir -p catalogs

for VERSION in ${VERSIONS}; do
  for CATALOG in ${CATALOGS}; do
    ./opm index export --index=registry.redhat.io/redhat/${CATALOG}:v${VERSION} --download-folder catalogs/${VERSION} -c podman
  done
done
