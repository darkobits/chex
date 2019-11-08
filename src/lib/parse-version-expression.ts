import semver from 'semver';


/**
 * Provided a version expression with an executable name and optional semver
 * range, returns an, object with the executable's name and the version range,
 * if present. If the range is invalid, an error is thrown.
 */
export default function parseVersionExpression(versionExpression: string) {
  const [name, versionRange] = versionExpression.split(' ');

  if (versionRange) {
    if (semver.validRange(versionRange)) {
      return {
        name: name.toLowerCase(),
        versionRange
      };
    }

    throw new Error(`Invalid semver range: ${versionRange}`);
  }

  return {name};
}
