
/**
 * List of flags, in order from most standards-compliant to least
 * standards-compliant, that programs may implement to display their version.
 */
export const versionFlags = ['--version', '-v', 'version'];


/**
 * List of different output streams on which a program can report its version
 * information.
 */
export const outputStreams: Array<'stdout' | 'stderr'> = ['stdout', 'stderr']; // tslint:disable-line no-unnecessary-type-annotation
