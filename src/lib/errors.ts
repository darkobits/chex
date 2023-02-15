/**
 * Thrown when the executable provided to Chex could not be found on the user's
 * system. It may not be installed, or we may not have read/executable
 * permissions.
 */
export class ExecutableNotFoundError extends Error {
  static readonly code = 'ERR_EXECUTABLE_NOT_FOUND';
  code = 'ERR_EXECUTABLE_NOT_FOUND';
}


/**
 * Thrown when a semver range was provided to Chex, but the executable does not
 * implement a way to check its version.
 */
export class VersionUnavailableError extends Error {
  static readonly code = 'ERR_VERSION_UNAVAILABLE';
  code = 'ERR_VERSION_UNAVAILABLE';
}


/**
 * Thrown when:
 *
 * - A semver range was provided to Chex, but the version of the executable is
 *   not a valid semver version.
 * - A semver range was provided to Chex, but it was not a valid semver
 *   expression.
 */
export class VersionInvalidError extends Error {
  static readonly code = 'ERR_VERSION_INVALID';
  code = 'ERR_VERSION_INVALID';
}


/**
 * Thrown when a semver range was provided to Chex, but the version of the
 * executable does not satisfy that semver range.
 */
export class VersionNotSatisfiedError extends Error {
  static readonly code = 'ERR_VERSION_NOT_SATISFIED';
  code = 'ERR_VERSION_NOT_SATISFIED';
}
