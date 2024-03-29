<a href="#top" id="top">
  <img src="https://user-images.githubusercontent.com/441546/101617498-88b78080-39c5-11eb-8b14-18038e29e5a2.png" style="max-width: 100%;">
</a>
<p align="center">
  <a href="https://www.npmjs.com/package/@darkobits/chex"><img src="https://img.shields.io/npm/v/@darkobits/chex.svg?style=flat-square"></a>
  <a href="https://github.com/darkobits/chex/actions?query=workflow%3Aci"><img src="https://img.shields.io/github/actions/workflow/status/darkobits/chex/ci.yml?style=flat-square"></a>
  <a href="https://depfu.com/github/darkobits/chex"><img src="https://img.shields.io/depfu/darkobits/chex?style=flat-square"></a>
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/static/v1?label=commits&message=conventional&style=flat-square&color=398AFB"></a>
</p>

If you use [Execa](https://github.com/sindresorhus/execa) in your application to integrate with other
executables, this tool provides a way to:

1. Verify that an executable is installed and fail fast if is isn't and/or:
2. Ensure that a particular version is installed and fail fast if it isn't.

## Install

```
$ npm install @darkobits/chex
```

## Use

Chex exports an async function that accepts a string. That string may be an executable name, or an
executable name and [valid semver range](https://devhints.io/semver). If a name alone is provided, Chex
makes sure the executable is installed. If a semver range is provided along with a name, Chex ensures
that the version of the executable satisfies that semver range. Chex then returns an Execa wrapper
bound to the provided executable.

Let's imagine we are writing a tool that is going to make several calls to the `git` CLI, and we know
that we need Git version 2.0.0 or greater. We want to make this assertion as early as possible in our
program so we can present the user with a meaningful error before we try to use an unsupported Git
feature. Let's see how we can accomplish this with Chex:

```ts
import chex from '@darkobits/chex';

// Assume this is our program's entrypoint.
export default async function main() {
  const git = await chex('git >=2.0.0');

  // Now, we can use this value just like Execa:
  const status = await git(['rev-parse', 'HEAD']);

  // If you prefer the string form, you can use that as well. Execa's
  // .command() variant is just an overload with Chex:
  const sha = await git('status');

  // Execa options are passed-though to Execa:
  const pushResult = await git('push origin master', { stdio: 'inherit' });

  // You can also do all of the above synchronously:
  const pullResult = git.sync('pull');
}
```

Need to integrate with several other tools? You can get fancy:

```ts
import chex from '@darkobits/chex';

// Assume this is our program's entrypoint.
export default async function main() {
  const dependencies = ['git >=2.0.0', 'docker', 'python'];

  // This will throw if any of the above aren't installed or the version isn't satisfied.
  const [git, docker, python] = await Promise.all(dependencies.map(chex));

  // ... do awesome things!
}
```

**But wait, there's more!**

Chex will also attach `version` and `rawVersion` properties to the value it returns, which you can use
for debugging/reporting:

```ts
import chex from '@darkobits/chex';

export default async function main() {
  const docker = await chex('docker >=19');

  console.log(docker.version);
  //=> '19.3.4'

  console.log(docker.rawVersion);
  //=> 'Docker version 19.03.4, build 9013bf5'
}
```

## API

Chex is available in asynchronous and synchronous modes. This package's default export is the
asynchronous function. The synchronous function is available at the `.sync` property.

```ts
interface Chex {
  (executableExpression: string, execaOpts?: execa.Options): Promise<ExecaWrapper>;
  sync(executableExpression: string, execaOpts?: execa.SyncOptions): ExecaWrapper;
}
```

**Note:** Execa options provided to `chex` or `chex.sync` will be used to configure the call to locate
the executable. Calls to the executable itself may be configured by providing an Execa options object to
the wrapper returned by Chex.

`ExecaWrapper` is a function with the following signature and properties:

```ts
interface ExecaWrapper {
  /**
   * Call the bound executable via Execa asynchronously.
   */
  (commandOrArgs: string | Array<string>, execaOpts?: ExecaOptions): ExecaChildProcess;

  /**
   * Call the bound executable via Execa synchronously.
   */
  sync(commandOrArgs: string | Array<string>, execaOpts?: ExecaOptions): ExecaSyncReturnValue;

  /**
   * Parsed/cleaned semver version of the executable.
   */
  version: string;

  /**
   * Raw version descriptor reported by the executable.
   */
  rawVersion: string;
}
```

**Note:** Both the synchronous and asynchronous versions of Chex return the same Execa wrapper, which
itself has synchronous and asynchronous modes. It is therefore possible to mix and match these call
types to fit your application's needs.

## Error Handling

Chex has a set of custom sub-classed Error types that make it easier to programmatically determine what
kind of error was thrown. You can either perform `instanceof` checks against errors thrown by Chex, or
check the `code` property of errors, which will be a string in the standard Node error code format.

All of these errors will be thrown by the initial call to Chex. If a bound Execa instance is
successfully created, they will throw [Execa errors](https://github.com/sindresorhus/execa#handling-errors),
which also contain a number of special properties to aid in error-handling.

**Case: Executable Not Found**

Thrown if the specified executable was not found on the user's system, either because it is not
installed or not readable/executable due to permissions errors, Chex will throw an
`ExecutableNotFoundError`.

The error's `cause` property will contain the original error thrown by Execa.

```ts
import chex, { ExecutableNotFoundError } from '@darkobits/chex';

try {
  const git = await chex('git');
} catch (err) {
  err instanceof ExecutableNotFoundError // true
  err.code === ExecutableNotFoundError.code // true

  /**
   * {
   *   name: 'ExecutableNotFoundError',
   *   code: 'ERR_EXECUTABLE_NOT_FOUND';
   *   message: string;
   *   cause: Error;
   * }
   */
}
```

**Case: Version Unavailable**

Thrown when a semver range was provided to Chex and the executable was found, but Chex was unable to
determine its version.

Chex attempts to call executables with the `-v`, `--version`, and `version` arguments. These arguments
are a standard way for a CLI to indicate its version, but it is entirely possible that an application
doesn't support any of them.

```ts
import chex, { VersionUnavailableError } from '@darkobits/chex';

try {
  const foo = await chex('foo >=2.0.0');
} catch (err) {
  err instanceof VersionUnavailableError // true
  err.code === VersionUnavailableError.code // true

  /**
   * {
   *   name: 'VersionUnavailableError',
   *   code: 'ERR_VERSION_UNAVAILABLE';
   *   message: string;
   * }
   */
}
```

**Case: Version Invalid**

Thrown when:
- A semver range was provided to Chex, but it was not a valid semver expression.
- A semver range was provided to Chex, but the version provided by the executable is not a valid semver
   version.

```ts
import chex, { VersionInvalidError } from '@darkobits/chex';

try {
  const foo = await chex('foo >=1.0.kittens');
} catch (err) {
  err instanceof VersionInvalidError // true
  err.code === VersionInvalidError.code // true

  /**
   * {
   *   name: 'VersionInvalidError',
   *   code: 'ERR_VERSION_INVALID';
   *   message: string;
   * }
   */
}

try {
  // Let's assume foo returns something like 'build-2018.04.12', which is not a
  // valid semver range.
  const foo = await chex('foo >=1.0.0');
} catch (err) {
  err instanceof VersionInvalidError // true
  err.code === VersionInvalidError.code // true

  /**
   * {
   *   name: 'VersionInvalidError',
   *   code: 'ERR_VERSION_INVALID';
   *   message: string;
   * }
   */
}
```

**Case: Version Not Satisfied**

Thrown when a semver range was provided to Chex and the executable provided a valid semver version, but
it did not satisfy the semver range required.

```ts
import chex, { VersionNotSatisfiedError } from '@darkobits/chex';

try {
  // Let's assume "foo -v" returned "18.5.1".
  const foo = await chex('foo >=19.0.3');
} catch (err) {
  err instanceof VersionNotSatisfiedError // true
  err.code === VersionNotSatisfiedError.code // true

  /**
   * {
   *   name: 'VersionNotSatisfiedError',
   *   code: 'ERR_VERSION_NOT_SATISFIED';
   *   message: string;
   * }
   */
}
```

<br />
<a href="#top">
  <img src="https://user-images.githubusercontent.com/441546/189774318-67cf3578-f4b4-4dcc-ab5a-c8210fbb6838.png" style="max-width: 100%;">
</a>
