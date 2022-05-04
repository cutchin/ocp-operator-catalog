# Openshift Operator Availability Tool
This evaluates operator version availability across OpenShift versions, and
generates a brief report about those operators/versions. To use it, do the following:

 - Edit `operators.txt` and specify a list of currently installed operator versions
 - Download `opm` and put it in the same directory as these scripts
 - Generate an operator catalog mirror for the desired OpenShift versions
 - Run `npm install`
 - Run ocp_operators.js

## Obtain `opm`
`opm` binaries are available here:

[https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/latest-4.10/](https://mirror.openshift.com/pub/openshift-v4/x86_64/clients/ocp/latest-4.10/)

## Generating Operator Catalogs
Red Hat provides a tool, [opm](https://docs.openshift.com/container-platform/4.9/cli_reference/opm/cli-opm-install.html)
which is used to perform operations on operator catalogs. For this tool, we use it to generate a
local mirror of the container registry.

A script has been provided - `generat-mirrors.sh` which shows how to run `opm` to pull catalogs
for a given version. The operator catalog is distributed as container images, and `opm` does 
not know how to pull container images natively, so it must use a secondary tool. In the case of the
script provided, it uses `podman`. On windows, presumably one would use docker. 

This script has the catalog versions it will pull hard-coded. Change the `VERSIONS` variable to your desired OCP version.
Currently it is fetching 4.7 and 4.10.

The registry storing Red Hat's operator catalog requires authentication, and that authentication must be done in the
tool which will be fetching the container images. Log in via podman and then run the script: 

```shell
podman login registry.redhat.io && \
  ./generate-mirrors.sh
```

On windows, you will likely need to modify `generate-mirrors.sh` to use `docker` for pulling images. See the last parameter
passed to `opm` in the script. Change it from `-c podman` to `-c docker`. You will also need to log into the Red Hat registry
with `docker` beforehand.

The process of generating mirrors will take ten minutes or more.

## Run the Catalog Version Script
Be sure you've run `npm install` in this directory first to fetch any required libraries. (Currently the only external
library required is a yaml parser.)

```shell
node ocp_operators.js
```

It should generate output similar to this:

```
Comparing operator availability from version 4.7 to 4.10:
Checking operator aws-efs-operator
 - Operator aws-efs-operator doesn't seem to be in the catalog for OCP 4.7
 - Operator aws-efs-operator does not seem to be in the catalog for OCP 4.10
Checking operator kiali-operator
 - Version v1.36.5 can be upgraded to v1.36.8 in OCP 4.7
 - Current version (v1.36.5) is in OCP 4.10
 - Version v1.36.5 can be upgraded to v1.36.8 in OCP 4.10
Checking operator compliance-operator
 - Version v0.1.47 does not seem to be in the catalog for OCP 4.7
 - Version v0.1.47 does not seem to be in the catalog for OCP 4.10
   - The latest version is v0.1.49.
Checking operator openshift-gitops-operator
 - Version v1.4.1 can be upgraded to v1.4.5 in OCP 4.7
 - Current version (v1.4.1) is in OCP 4.10
 - Version v1.4.1 can be upgraded to v1.4.5 in OCP 4.10
Checking operator datagrid-operator
 - Version v8.2.8 can be upgraded to v8.3.3 in OCP 4.7
 - Current version (v8.2.8) is in OCP 4.10
 - Version v8.2.8 can be upgraded to v8.3.3 in OCP 4.10
Checking operator jaeger-operator
 - Version v1.24.1 can be upgraded to v2.0.0-tp.1 in OCP 4.7
 - Current version (v1.24.1) is in OCP 4.10
 - Version v1.24.1 can be upgraded to v2.0.0-tp.1 in OCP 4.10
Checking operator servicemeshoperator
 - Version v2.0.8 can be upgraded to v2.1.2 in OCP 4.7
 - Current version (v2.0.8) is in OCP 4.10
 - Version v2.0.8 can be upgraded to v2.1.2 in OCP 4.10
Checking operator 3scale-operator
 - Version v0.7.0 can be upgraded to v0.8.3-0.1649688682.p in OCP 4.7
 - Current version (v0.7.0) is in OCP 4.10
 - Version v0.7.0 can be upgraded to v0.8.3-0.1649688682.p in OCP 4.10
Checking operator splunk-forwarder-operator
 - Operator splunk-forwarder-operator doesn't seem to be in the catalog for OCP 4.7
 - Operator splunk-forwarder-operator does not seem to be in the catalog for OCP 4.10
```
