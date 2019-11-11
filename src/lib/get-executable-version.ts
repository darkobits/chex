import execa from 'execa';
import findVersions from 'find-versions';
import semver from 'semver';


/**
 * Supported flags.
 */
const versionFlags = ['--version', '-v', 'version'];


/**
 * Default return value when an executable's version cannot be determined.
 */
const unknownVersionResult = {version: 'unknown', rawVersion: 'unknown'};


/**
 * Normalizes executable names.
 */
function normalizeName(name: string) {
  return name.toLocaleLowerCase();
}


/**
 * Attempt to read from various output streams, in order.
 */
function parseVersionResult(result: execa.ExecaReturnBase<string>) {
  // Attempt to read from various output streams, in order.
  for (const stream of ['stdout', 'stderr'] as Array<'stdout' | 'stderr'>) {
    const rawVersion = result[stream];

    // If we didn't get anything on this stream, try the next one.
    if (!rawVersion) {
      continue;
    }

    const strictVersion = findVersions(rawVersion)[0];

    if (strictVersion) {
      return {version: strictVersion, rawVersion};
    }

    const looseVersion = semver.clean(findVersions(rawVersion, {loose: true})[0], {loose: true});

    if (looseVersion) {
      return {version: looseVersion, rawVersion};
    }
  }
}


/**
 * Provided an error thrown by Execa, re-throws if the error indicates that the
 * executable in the original command could not be found.
 */
function handleError(err: any) {
  // Executable does not exist or is otherwise not installed correctly.
  if (err && err.errno === 'ENOENT') {
    throw err;
  }

  // For any other error, we can assume the version flag is not supported,
  // so we can recover.
}


/**
 * Provided an executable name, uses various techniques to determine its version.
 * If successful, resolves with the version of the executable. If the version
 * could not be determined, resolves with the string 'unknown'. If the
 * executable does not exist on the system, an error will be thrown.
 */
async function getExecutableVersion(name: string) {
  for (const flag of versionFlags) {
    try {
      const version = parseVersionResult(await execa.command(`${normalizeName(name)} ${flag}`));

      if (version) {
        return version;
      }
    } catch (err) {
      handleError(err);
    }
  }

  return unknownVersionResult;
}


/**
 * Synchronous version of the above.
 */
getExecutableVersion.sync = (name: string) => {
  for (const flag of versionFlags) {
    try {
      const version = parseVersionResult(execa.commandSync(`${normalizeName(name)} ${flag}`));

      if (version) {
        return version;
      }
    } catch (err) {
      handleError(err);
    }
  }

  return unknownVersionResult;
};


export default getExecutableVersion;
