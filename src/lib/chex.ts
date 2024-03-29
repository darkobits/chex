import execa, {
  type ExecaChildProcess,
  type ExecaSyncReturnValue,
  type Options,
  type SyncOptions
} from 'execa';
import semver from 'semver';

import {
  VersionInvalidError,
  VersionNotSatisfiedError,
  VersionUnavailableError
} from 'lib/errors';
import getExecutableVersion from 'lib/get-executable-version';


/**
 * Provided a version expression with an executable name and optional semver
 * range, returns an object with the executable's name and the version range,
 * if present. If the range is invalid, an error is thrown.
 */
function parseDependencyExpression(versionExpression: string) {
  const [rawName, versionRange] = versionExpression.split(' ');
  const name = rawName.toLowerCase();

  if (versionRange) {
    if (semver.validRange(versionRange)) {
      // Valid range provided.
      return { name, versionRange };
    }

    // Invalid range provided.
    throw new VersionInvalidError(`Invalid semver range for "${name}": ${versionRange}`);
  }

  // No range provided.
  return { name, versionRange: '' };
}


/**
 * Value returned by Chex.
 */
export interface ExecaWrapper {
  /**
   * Call the bound executable asynchronously.
   */
  (command: string | ReadonlyArray<string>, options?: Options): ExecaChildProcess;

  /**
   * Call the bound executable synchronously.
   */
  sync(command: string | ReadonlyArray<string>, options?: SyncOptions): ExecaSyncReturnValue;

  /**
   * Parsed semver version of the executable.
   */
  version: string;

  /**
   * Raw version reported by the executable.
   */
  rawVersion: string;
}


/**
 * Logic common to the asynchronous and synchronous versions of Chex.
 */
function chexCommon(name: string, versionRange: string, version: string, rawVersion: string): ExecaWrapper {
  // If the user supplied a version range and we couldn't determine the version
  // of the executable, throw.
  if (versionRange && version === 'unknown') {
    throw new VersionUnavailableError(`Unable to determine version of "${name}"`);
  }

  // If the user supplied a version range but the executable returned an invalid
  // semver version, throw.
  if (versionRange && !semver.valid(version)) {
    throw new VersionInvalidError(`Version "${version}" of "${name}" is not a valid semver version.`);
  }

  // If the user supplied a version range and the executable's version does not
  // satisfy it, throw.
  if (versionRange && !semver.satisfies(version, versionRange)) {
    throw new VersionNotSatisfiedError(`Version "${version}" of "${name}" does not satisfy criteria "${versionRange}".`);
  }

  const execaWrapper = (commandStringOrArgumentsArray: string | ReadonlyArray<string>, execaOpts?: Options) => {
    if (typeof commandStringOrArgumentsArray === 'string') {
      return execa.command(`${name} ${commandStringOrArgumentsArray}`, execaOpts);
    }

    return execa(name, commandStringOrArgumentsArray, execaOpts);
  };

  execaWrapper.sync = (commandStringOrArgumentsArray: string | ReadonlyArray<string>, execaOpts?: SyncOptions) => {
    if (typeof commandStringOrArgumentsArray === 'string') {
      return execa.commandSync(`${name} ${commandStringOrArgumentsArray}`, execaOpts);
    }

    return execa.sync(name, commandStringOrArgumentsArray, execaOpts);
  };

  // Attach the resolved executable version to the Execa wrapper.
  execaWrapper.version = version;
  execaWrapper.rawVersion = rawVersion;

  return execaWrapper;
}


/**
 * Asynchronous version of Chex.
 */
const chex = async (dependencyExpression: string, execaOpts?: Options): Promise<ExecaWrapper> => {
  // Parse input.
  const { name, versionRange } = parseDependencyExpression(dependencyExpression);

  // Get version, throw if executable is not found.
  const { version, rawVersion } = await getExecutableVersion(name, execaOpts);

  // Return Execa wrapper, throw if version is not satisfied.
  return chexCommon(name, versionRange, version, rawVersion);
};


/**
 * Synchronous version of Chex.
 */
chex.sync = (dependencyExpression: string, execaOpts?: SyncOptions): ExecaWrapper => {
  // Parse input.
  const { name, versionRange } = parseDependencyExpression(dependencyExpression);

  // Get version, throw if executable is not found.
  const { version, rawVersion } = getExecutableVersion.sync(name, execaOpts);

  // Return Execa wrapper, throw if version is not satisfied.
  return chexCommon(name, versionRange, version, rawVersion);
};


export default chex;
