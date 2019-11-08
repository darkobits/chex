import execa from 'execa';
import {versionFlags, outputStreams} from 'etc/constants';
import versionExtractors from 'lib/resolvers';


/**
 * Provided an executable name, uses various techniques to determine its version.
 * If successful, resolves with the version of the executable. If the version
 * could not be determined, resolves with the string 'unknown'. If the
 * executable does not exist on the system, an error will be thrown.
 */
export default async function getExecutableVersion(name: string) {
  const normalizedName = name.toLocaleLowerCase();

  // Attempt various version flags, in order.
  for (const flag of versionFlags) {
    try {
      const result = await execa.command(`${normalizedName} ${flag}`);

      // Attempt to read from various output streams, in order.
      for (const stream of outputStreams) {
        const streamData = result[stream];

        // If we didn't get anything on this stream, try the next one.
        if (!streamData) {
          continue;
        }

        // Attempt to parse version string with various parsers, in order.
        for (const versionExtractor of versionExtractors) {
          const version = versionExtractor(streamData);

          // If we got something, return early.
          if (version) {
            return version;
          }
        }
      }
    } catch (err) {
      // Executable does not exist or is otherwise not installed correctly.
      if (err && err.errno === 'ENOENT') {
        throw err;
      }

      // For any other error, we can assume the version flag is not supported,
      // so we can recover and keep looping.
    }
  }

  return 'unknown';
}
