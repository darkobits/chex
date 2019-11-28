import execa from 'execa';
import uuid from 'uuid/v4';

import getExecutableVersion from 'lib/get-executable-version';
import chex from './chex';


jest.mock('execa', () => {
  const execaMock: any = jest.fn(async () => {
    // Empty block.
  });
  execaMock.sync = jest.fn();
  execaMock.command = jest.fn(async () => {
    // Empty block.
  });
  execaMock.commandSync = jest.fn();
  return execaMock;
});

jest.mock('lib/get-executable-version', () => {
  const getExecutableVersionMock = (name: string) => {
    // console.warn('[FOO]', name);

    if (name === 'unknown') {
      return {version: 'unknown', rawVersion: 'unknown'};
    }

    if (name === 'bad') {
      return {version: 'froopy loops', rawVersion: 'froopy loops'};
    }

    return {version: '1.2.3', rawVersion: '1.2.3'};
  };

  const asyncMock: any = jest.fn(async (name: string) => getExecutableVersionMock(name));
  asyncMock.sync = jest.fn(getExecutableVersionMock);

  return asyncMock;
});

describe('chex', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('async', () => {
    describe('parsing expressions', () => {
      const NAME = uuid();

      describe('when provided a name only', () => {
        it('should call getExecutableVersion', async () => {
          await chex(NAME);
          expect(getExecutableVersion).toHaveBeenCalledWith(NAME, undefined);
        });

        it('should return an execa wrapper', async () => {
          const execaWrapper = await chex(NAME);
          expect(typeof execaWrapper).toBe('function');
          expect(typeof execaWrapper.sync).toBe('function');

          expect(typeof execaWrapper.version).toBe('string');
          expect(typeof execaWrapper.rawVersion).toBe('string');
        });
      });

      describe('when provided a name and valid semver range', () => {
        const VERSION = '>=1.2.3';

        it('should call getExecutableVersion', async () => {
          await chex(`${NAME} ${VERSION}`);
          expect(getExecutableVersion).toHaveBeenCalledWith(NAME, undefined);
        });

        it('should return an execa wrapper', async () => {
          const execaWrapper = await chex(NAME);
          expect(typeof execaWrapper).toBe('function');
          expect(typeof execaWrapper.sync).toBe('function');

          expect(execaWrapper.version).toBe('1.2.3');
          expect(execaWrapper.rawVersion).toBe('1.2.3');
        });

        describe('and the executable version could not be determined', () => {
          it('should throw an error', async () => {
            expect.assertions(1);

            try {
              await chex('unknown 1.2.3');
            } catch (err) {
              expect(err.message).toMatch('Unable to determine version of "unknown"');
            }
          });
        });

        describe('and the executable returned an un-parse-able version descriptor', () => {
          it('should throw an error', async () => {
            expect.assertions(1);

            try {
              await chex('bad 1.2.3');
            } catch (err) {
              expect(err.message).toMatch('Version "froopy loops" of "bad" is not a valid semver version.');
            }
          });
        });

        describe('and the executable version does not satisfy the range', () => {
          const OUT_OF_RANGE_VERSION = '>=4.5.6';

          it('should throw an error', async () => {
            expect.assertions(1);

            try {
              await chex(`${NAME} ${OUT_OF_RANGE_VERSION}`);
            } catch (err) {
              expect(err.message).toMatch(`Version "1.2.3" of "${NAME}" does not satisfy`);
            }
          });
        });
      });

      describe('when provided a name and invalid semver range', () => {
        it('should throw an error', async () => {
          expect.assertions(1);

          try {
            await chex('foo A.B.C');
          } catch (err) {
            expect(err.message).toMatch('Invalid semver range');
          }
        });
      });
    });
  });

  describe('sync', () => {
    describe('parsing expressions', () => {
      const NAME = uuid();

      describe('when provided a name only', () => {
        it('should call getExecutableVersion', () => {
          chex.sync(NAME);
          expect(getExecutableVersion.sync).toHaveBeenCalledWith(NAME, undefined);
        });

        it('should return an execa wrapper', () => {
          const execaWrapper = chex.sync(NAME);
          expect(typeof execaWrapper).toBe('function');
          expect(typeof execaWrapper.sync).toBe('function');

          expect(typeof execaWrapper.version).toBe('string');
          expect(typeof execaWrapper.rawVersion).toBe('string');
        });
      });

      describe('when provided a name and valid semver range', () => {
        const VERSION = '>=1.2.3';

        it('should call getExecutableVersion', () => {
          chex.sync(`${NAME} ${VERSION}`);
          expect(getExecutableVersion.sync).toHaveBeenCalledWith(NAME, undefined);
        });

        it('should return an execa wrapper', () => {
          const execaWrapper = chex.sync(NAME);
          expect(typeof execaWrapper).toBe('function');
          expect(typeof execaWrapper.sync).toBe('function');

          expect(execaWrapper.version).toBe('1.2.3');
          expect(execaWrapper.rawVersion).toBe('1.2.3');
        });

        describe('and the executable version could not be determined', () => {
          it('should throw an error', () => {
            expect.assertions(1);

            try {
              chex.sync('unknown 1.2.3');
            } catch (err) {
              expect(err.message).toMatch('Unable to determine version of "unknown"');
            }
          });
        });

        describe('and the executable returned an un-parse-able version descriptor', () => {
          it('should throw an error', () => {
            expect.assertions(1);

            try {
              chex.sync('bad 1.2.3');
            } catch (err) {
              expect(err.message).toMatch('Version "froopy loops" of "bad" is not a valid semver version.');
            }
          });
        });

        describe('and the executable version does not satisfy the range', () => {
          const OUT_OF_RANGE_VERSION = '>=4.5.6';

          it('should throw an error', () => {
            expect.assertions(1);

            try {
              chex.sync(`${NAME} ${OUT_OF_RANGE_VERSION}`);
            } catch (err) {
              expect(err.message).toMatch(`Version "1.2.3" of "${NAME}" does not satisfy`);
            }
          });
        });
      });

      describe('when provided a name and invalid semver range', () => {
        it('should throw an error', () => {
          expect.assertions(1);

          try {
            chex.sync('foo A.B.C');
          } catch (err) {
            expect(err.message).toMatch('Invalid semver range');
          }
        });
      });
    });
  });

  describe('execa Wrapper', () => {
    const NAME = uuid();

    describe('async', () => {
      describe('when provided a string of arguments', () => {
        it('should call execa.command', async () => {
          const wrapper = await chex(NAME);
          await wrapper('ARG1 ARG2');
          expect(execa.command).toHaveBeenCalledWith(`${NAME} ARG1 ARG2`, undefined);
        });
      });

      describe('when provided an array of arguments', () => {
        it('should call execa', async () => {
          const wrapper = await chex(NAME);
          await wrapper(['ARG1', 'ARG2']);
          expect(execa).toHaveBeenCalledWith(NAME, ['ARG1', 'ARG2'], undefined);
        });
      });
    });

    describe('sync', () => {
      describe('when provided a string of arguments', () => {
        it('should call execa.commandSync', async () => {
          const wrapper = await chex(NAME);
          wrapper.sync('ARG1 ARG2');
          expect(execa.commandSync).toHaveBeenCalledWith(`${NAME} ARG1 ARG2`, undefined);
        });
      });

      describe('when provided an array of arguments', () => {
        it('should call execa.sync', async () => {
          const wrapper = await chex(NAME);
          wrapper.sync(['ARG1', 'ARG2']);
          expect(execa.sync).toHaveBeenCalledWith(NAME, ['ARG1', 'ARG2'], undefined);
        });
      });
    });
  });
});
