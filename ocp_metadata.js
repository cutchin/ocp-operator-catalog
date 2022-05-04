import {readdir, readFile, stat} from 'fs/promises';
import { parse as yaml_parse, stringify as yaml_stringify } from 'yaml'

export async function readOCPOperatorsSet(baseDir) {
  const fileNames = await readdir(baseDir);

  const result = {};

  // Get all the operator directories, which will have version directories inside them
  for (const fileName of fileNames) {
    const path = `${baseDir}/${fileName}`;
    const fileStats = await stat(path);
    if (fileStats.isDirectory()) {
      await getVersions(path, result);
    }
  }

  return result;
}

async function getVersions(dir, operators) {
  const versionDirs = await readdir(dir);

  // and now we have a series of directories for version numbers
  for (const versionDir of versionDirs) {
    const path = `${dir}/${versionDir}`;
    const fileStats = await stat(path);

    if (fileStats.isDirectory()) {
      await parseVersion(path, operators);
    }
  }
}

async function parseVersion(dir, operators) {
  const fileNames = await readdir(dir);

  for (const fileName of fileNames) {
    if (fileName.endsWith('clusterserviceversion.yaml')) {
      const contents = await readFile(`${dir}/${fileName}`);
      let versionData;

      try {
        versionData = yaml_parse(contents.toString());
      } catch (e) {
        console.log(`Error parsing ${dir}/${fileName} - ${e}`);
        return;
      }
      const operatorName = versionData?.metadata?.name;

      if (operatorName) {
        const dotPos = operatorName.indexOf('.');

        if (dotPos !== -1) {
          const name = operatorName.substring(0, dotPos);
          const version = operatorName.substring(dotPos + 1);

          if (!operators[name]) {
            operators[name] = [];
          }

          operators[name].push(version);
        }
      }
    }
  }
}
