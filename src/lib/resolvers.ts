import findVersions from 'find-versions';
import semver from 'semver';


/**
 * Functions that accept a version string and attempt to find the first valid
 * version-looking token in it, one in "strict" mode and one in "loose" mode.
 * These are arranged this way so that they can be iterated over in priority
 * order.
 */
export default [
  (version: string) => {
    return findVersions(version)[0];
  },
  (version: string) => {
    return semver.clean(findVersions(version, {loose: true})[0], {loose: true});
  }
];
