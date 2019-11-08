<a href="#top" id="top">
  <img src="https://user-images.githubusercontent.com/441546/68451993-d6036600-01a5-11ea-89cb-61811521229e.png" style="max-width: 100%;">
</a>
<p align="center">
  <a href="https://www.npmjs.com/package/@darkobits/chex"><img src="https://img.shields.io/npm/v/@darkobits/chex.svg?style=flat-square"></a>
  <a href="https://github.com/darkobits/chex/actions"><img src="https://img.shields.io/endpoint?url=https://aws.frontlawn.net/ga-shields/darkobits/chex&style=flat-square"></a>
  <a href="https://www.codacy.com/app/darkobits/chex"><img src="https://img.shields.io/codacy/coverage/7db80a17ba84452a8c619fdf34c9c447.svg?style=flat-square"></a>
  <a href="https://david-dm.org/darkobits/chex"><img src="https://img.shields.io/david/darkobits/chex.svg?style=flat-square"></a>
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/conventional%20commits-1.0.0-FB5E85.svg?style=flat-square"></a>
</p>

If you use [execa](https://github.com/sindresorhus/execa) in your application to
integrate with other executables, this tool provides a way to:

1. Verify that an executable is installed and fail fast if is isn't and/or:
2. Ensure that a particular version is installed and fail fast if it isn't.

## Install

```
$ npm install @darkobits/chex
```

## Use

Chex exports an async function that accepts a string. That string may be an
executable name, or an executable name and [valid semver range](https://devhints.io/semver).
If a name alone is provided, Chex makes sure the executable is installed. If a
semver range is provided along with a name, Chex ensures that the version of the
executable satisfies that semver range. Chex then returns an Execa decorator
bound to the provided executable.

Let's imagine we are writing a tool that is going to make several calls to the
`git` CLI, and we know that we need Git version 2.0.0 or greater. We want to
make this assertion as early as possible in our program so we can present the
user with a meaningful error before we try to use an unsupported Git feature.
Let's see how we can accomplish this with Chex:

```ts
import chex from '@darkobits/chex';

// Assume this is our program's entrypoint.
export default async function main() {
  const git = await chex('git >=2.0.0');

  // Now, we can use this value just like execa:
  const status = await git('status');

  // If you prefer the array form, you can use that as well. Execa's
  // .command() variant is just an overload with Chex:
  const sha = await git(['rev-parse', 'HEAD']);

  // Execa options are passed-though to execa:
  const pushResult = await git('push origin master', {stdio: 'inherit'});

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

Chex will also attach a `version` property to the value it returns, which you
can use for debugging/reporting:

```ts
import chex from '@darkobits/chex';

export default async function main() {
  const docker = await chex('docker');

  console.log(`Using Docker version: ${docker.version}`);
  //=> 'Using Docker version: 19.03.4'

  const images = await docker('images ls');
  console.log(images.stdout);
}
```

## API

Chex exports an async function with the following signature:

```ts
chex(executableExpression: string): Promise<ExecaWrapper>;
```

`ExecaWrapper` is a function with the following signature:

```
(commandOrArgs: string | Array<string>, execaOptions?: ExecaOptions): ExecaChildProcess;
```

This function also has the following properties:

```
sync(commandOrArgs: string | Array<string>, execaOptions?: ExecaOptions): ExecaSyncReturnValue;
version: string;
```

## Caveats

Some tools make the process of determining their version exceedingly difficult,
and others fail to follow the semver scheme. In these cases, Chex will still
work when provided an executable's name (and will still throw if it can't be
found) but will throw an error if a semver range was provided, because in these
cases Chex cannot guarantee the executable's version satisfies the provided
criteria.

For example, Docker, a common containerization tool, does not follow semver. If
we have Docker CE `19.03.4` installed, the following code would throw an error:

```ts
await chex('docker >=19.0.0')
```

```
Error: Version "19.03.4" of "docker" is not a valid semver version. Please refer the authors of this
software to https://semver.org.
```


## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>
