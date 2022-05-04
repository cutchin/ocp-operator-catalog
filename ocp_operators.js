import { readOCPOperatorsSet } from "./ocp_metadata.js";
import {readdir, stat, readFile } from "fs/promises";

const CATALOG_DIR = './catalogs';

const installedOperators = [
  'aws-efs-operator.v0.0.8',
  'kiali-operator.v1.36.5',
  'compliance-operator.v0.1.47',
  'openshift-gitops-operator.v1.4.1',
  'datagrid-operator.v8.2.8',
  'jaeger-operator.v1.24.1',
  'servicemeshoperator.v2.0.8',
  '3scale-operator.v0.7.0',
  'splunk-forwarder-operator.v0.1.299-a68db6c'
];

function checkOperatorVersion(operatorName, currentOCP, futureOCP) {
  const dotPos = operatorName.indexOf('.');
  if (dotPos === -1) {
    console.log(`Cannot determine name/version of operator ${operatorName}`);
  }

  const name = operatorName.substring(0, dotPos);
  const version = operatorName.substring(dotPos + 1);

  const currVersions = currentOCP.operators[name];
  const nextVersions = futureOCP.operators[name];

  console.log(`Checking operator ${name}`)
  if (!currVersions) {
    console.log(` - Operator ${name} doesn't seem to be in the catalog for OCP ${currentOCP.version}`);
  } else {
    const versionIdx = currVersions.indexOf(version);
    if (versionIdx === -1) {
      console.log(` - Version ${version} does not seem to be in the catalog for OCP ${currentOCP.version}`);
    } else {
      if (versionIdx === currVersions.length - 1) {
        console.log(` - Version ${version} is the latest version for OCP ${currentOCP.version}`);
      } else {
        console.log(` - Version ${version} can be upgraded to ${currVersions[currVersions.length - 1]} in OCP ${currentOCP.version}`);
      }
    }
  }

  if (!nextVersions) {
    console.log(` - Operator ${name} does not seem to be in the catalog for OCP ${futureOCP.version}`);
  } else {
    const versionIdx = currVersions.indexOf(version);
    if (versionIdx === -1) {
      console.log(` - Version ${version} does not seem to be in the catalog for OCP ${futureOCP.version}`);
      console.log(`   - The latest version is ${currVersions[currVersions.length - 1]}.`);
    } else {
      console.log(` - Current version (${version}) is in OCP ${futureOCP.version}`);
      if (versionIdx === currVersions.length - 1) {
        console.log(` - Version ${version} is the latest version for OCP ${futureOCP.version}`);
      } else {
        console.log(` - Version ${version} can be upgraded to ${currVersions[currVersions.length - 1]} in OCP ${futureOCP.version}`);
      }
    }
  }
}

// OCP uses semantic versioning, which doesn't sort properly when compared as ASCII strings or as numbers
function versionComparator(ver1, ver2) {
  const segments1 = ver1.split('.');
  const segments2 = ver2.split('.');

  for (let x = 0; x < segments1.length; x++) {
    if (x > segments2.length - 1) {
      return 1;
    }

    if (segments1[x] !== segments2[x]) {
      return Number.parseInt(segments1[x]) - Number.parseInt(segments2[x]);
    }
  }

  return 0;
}

async function getCatalogVersions() {
  const fileNames = await readdir(CATALOG_DIR);

  const versions = [];

  for (const fileName of fileNames) {
    const path = `${CATALOG_DIR}/${fileName}`;
    const fileStats = await stat(path);

    if (fileStats.isDirectory()) {
      versions.push({
        version: fileName,
        operators: await readOCPOperatorsSet(`${CATALOG_DIR}/${fileName}`)
      });
    }
  }

  return versions;
}

async function getInstalledOperators() {
  const contents = await readFile('./operators.txt');
  return contents.toString().split(/\s+/).map(op => op.trim()).filter(op => op.length > 0);
}

Promise.all([getCatalogVersions(), getInstalledOperators()]).then(values => {
  const catalog_versions = values[0];

  const operators = values[1];

  catalog_versions.sort((v1, v2) => versionComparator(v1.version, v2.version));

  for (let x = 1; x < catalog_versions.length; x++) {
    console.log(`Comparing operator availability from version ${catalog_versions[0].version} to ${catalog_versions[x].version}:`);
    for (const operator of installedOperators) {
      checkOperatorVersion(operator, catalog_versions[0], catalog_versions[1]);
    }
    console.log();
    console.log();
  }
});
