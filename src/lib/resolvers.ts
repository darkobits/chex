import findVersions from 'find-versions';


/**
 * Functions that accept a version string and attempt to find the first valid
 * version-looking string in it, one in "strict" mode and one in "loose" mode.
 * These are arranged this way so that they can be iterated over in priority
 * order.
 */
export default [
  (version: string) => findVersions(version)[0],
  (version: string) => findVersions(version, {loose: true})[0]
];
