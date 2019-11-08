import semver from 'semver';


/**
 * Provided a version expression with an executable name and optional semver
 * range, returns an, object with the executable's name and the version range,
 * if present. If the range is invalid, an error is thrown.
 */
export default function parseVersionExpression(versionExpression: string) {
  const [rawName, versionRange] = versionExpression.split(' ');
  const name = rawName.toLowerCase();

  if (versionRange) {
    if (semver.validRange(versionRange)) {
      // Valid range provided.
      return {name, versionRange};
    }

    // Invalid range provided.
    throw new Error(`Invalid semver range: ${versionRange}`);
  }

  // No range provided.
  return {name, versionRange: ''};
}
