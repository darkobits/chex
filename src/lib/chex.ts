import execa from 'execa';
import semver from 'semver';
import getDependencyVersion from 'lib/get-executable-version';
import parseDependencyExpression from 'lib/parse-version-expression';


/**
 * Value returned from getExe.
 */
export interface BoundExeca {
  version: string;
  (command: string | ReadonlyArray<string>, options?: execa.Options): execa.ExecaChildProcess;
  sync(command: string | ReadonlyArray<string>, options?: execa.SyncOptions): execa.ExecaSyncReturnValue;
}


/**
 * Verifies that the provided executable is installed and available in our PATH.
 */
export default async function getExecutable(dependencyExpression: string) {
  const {name, versionRange} = parseDependencyExpression(dependencyExpression);

  let version: string;

  try {
    // This will throw if the dependency doesn't exist.
    version = await getDependencyVersion(name);
  } catch (err) {
    throw new Error(`Executable "${name}" could not be found.`);
  }

  // If the user supplied a version range and we couldn't determine the version
  // of the executable, throw.
  if (versionRange && version === 'unknown') {
    throw new Error(`Unable to determine installed version of "${name}"`);
  }

  // If the user supplied a version range but the executable returned an invalid
  // semver version, throw.
  if (versionRange && !semver.valid(version)) {
    throw new Error(`Version "${version}" of "${name}" is not a valid semver version. Please refer the authors of this software to https://semver.org.`);
  }

  // If the user supplied a version range and the executable's version does not
  // satisfy it, throw.
  if (versionRange && !semver.satisfies(version, versionRange)) {
    throw new Error(`Version "${version}" of "${name}" does not satisfy required range "${versionRange}".`);
  }

  // Return a function bound to the executable.
  const boundExeca = (commandStringOrArgumentsArray: string | Array<string>, execaOpts?: execa.Options) => {
    if (typeof commandStringOrArgumentsArray === 'string') {
      return execa.command(`${name} ${commandStringOrArgumentsArray}`, execaOpts);
    }

    return execa(name, commandStringOrArgumentsArray, execaOpts);
  };

  // Support sync calls.
  boundExeca.sync = (commandStringOrArgumentsArray: string | Array<string>, execaOpts?: execa.SyncOptions) => {
    if (typeof commandStringOrArgumentsArray === 'string') {
      return execa.commandSync(`${name} ${commandStringOrArgumentsArray}`, execaOpts);
    }

    return execa.sync(name, commandStringOrArgumentsArray, execaOpts);
  };

  // Attach the resolved executable version to our function.
  boundExeca.version = version;

  return boundExeca as BoundExeca;
}
