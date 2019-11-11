import getExecutableVersionType from './get-executable-version';


describe('getExecutableVersion', () => {
  let getExecutableVersion: typeof getExecutableVersionType;

  const testExecutables = [
    {
      'name': 'a',
      '--version': '1.0.0',
      'stream': 'stdout'
    },
    {
      'name': 'b',
      '--version': '1.0.1',
      'stream': 'stderr'
    },
    {
      'name': 'c',
      '-v': 'Cee v1.0.2 build 28',
      'stream': 'stdout'
    },
    {
      'name': 'd',
      '-v': '1.04.3 and some other garbage',
      'stream': 'stderr'
    },
    {
      name: 'e',
      version: '1.0.4',
      stream: 'stdout'
    },
    {
      name: 'f',
      version: '1.0.5',
      stream: 'stderr'
    },
    {
      name: 'g',
      stream: 'stdout'
    },

  ];

  beforeEach(() => {
    jest.doMock('execa', () => {
      const execa = async (command: string) => {
        const [name, versionFlag] = command.split(' ');
        const result = testExecutables.find(descriptor => descriptor.name === name);

        if (!result) {
          const err = new Error();
          // @ts-ignore
          err.errno = 'ENOENT';
          throw err;
        }

        if (!Reflect.has(result, versionFlag)) {
          throw new Error();
        }

        return {[result.stream]: Reflect.get(result, versionFlag)};
      };

      execa.command = execa;
      return execa;
    });

    getExecutableVersion = require('./get-executable-version'); // tslint:disable-line no-require-imports
  });

  describe('when the executable supports `--version`', () => {
    describe('and writes to stdout', () => {
      it('should return the version', async () => {
        const result = await getExecutableVersion('a');
        expect(result).toMatchObject({
          version: '1.0.0'
        });
      });
    });

    describe('and writes to stderr', () => {
      it('should return the version', async () => {
        const result = await getExecutableVersion('b');
        expect(result).toMatchObject({
          version: '1.0.1'
        });
      });
    });
  });

  describe('when the executable supports `-v`', () => {
    describe('and writes to stdout', () => {
      it('should return the version', async () => {
        const result = await getExecutableVersion('c');
        expect(result).toMatchObject({
          version: '1.0.2',
          rawVersion: 'Cee v1.0.2 build 28'
        });
      });
    });

    describe('and writes to stderr', () => {
      it('should return the version', async () => {
        const result = await getExecutableVersion('d');
        expect(result).toMatchObject({
          version: '1.4.3',
          rawVersion: '1.04.3 and some other garbage'
        });
      });
    });
  });

  describe('when the executable supports `version`', () => {
    describe('and writes to stdout', () => {
      it('should return the version', async () => {
        const result = await getExecutableVersion('e');
        expect(result).toMatchObject({
          version: '1.0.4'
        });
      });
    });

    describe('and writes to stderr', () => {
      it('should return the version', async () => {
        const result = await getExecutableVersion('f');
        expect(result).toMatchObject({
          version: '1.0.5'
        });
      });
    });
  });

  describe('when the executable does not support any known version flags', () => {
    it('should return "unknown"', async () => {
      const result = await getExecutableVersion('g');
      expect(result).toMatchObject({
        version: 'unknown',
        rawVersion: 'unknown'
      });
    });
  });

  describe('otherwise', () => {
    it('should throw an error', async () => {
      expect.assertions(1);

      try {
        await getExecutableVersion('h');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
  });
});
