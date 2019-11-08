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

  for (const flag of versionFlags) {
    try {
      const result = await execa.command(`${normalizedName} ${flag}`);

      for (const stream of outputStreams) {
        const streamData = result[stream];

        for (const versionExtractor of versionExtractors) {
          const version = versionExtractor(streamData);

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
    }
  }

  return 'unknown';
}
