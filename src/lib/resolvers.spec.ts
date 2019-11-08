import resolvers from './resolvers';

describe('resolvers', () => {
  const [strict, loose] = resolvers;

  describe('strict', () => {
    it('should return the first valid semver token it finds', () => {
      expect(strict('1.2.3')).toBe('1.2.3');
      expect(strict('v1.2.3')).toBe('1.2.3');
      expect(strict('version 1.2.3')).toBe('1.2.3');
      expect(strict('Tool version 1.2.3')).toBe('1.2.3');
      expect(strict('Tool 1.2.3 build 0f4c25')).toBe('1.2.3');
      expect(strict('Tool 1.2.3-beta.0 build 0f4c25')).toBe('1.2.3-beta.0');
    });

    it('should return `undefined` when it cannot find a valid semver token', () => {
      expect(strict('1.02.03')).toBe(undefined);
      expect(strict('v1.02.03')).toBe(undefined);
      expect(strict('version 1.02.03')).toBe(undefined);
      expect(strict('Tool 1.02.03')).toBe(undefined);
      expect(strict('Tool 30.1')).toBe(undefined);
      expect(strict('Tool 1.2.3_beta5')).toBe(undefined);
    });
  });

  describe('loose', () => {
    it('should generally speaking, be a good sport', () => {
      expect(loose('1.02.03')).toBe('1.02.03');
      expect(loose('v1.02.03')).toBe('1.02.03');
      expect(loose('version 1.02.03')).toBe('1.02.03');
      expect(loose('Tool 1.02.03')).toBe('1.02.03');
      expect(loose('Tool 30.1')).toBe('30.1.0');
      expect(loose('Tool 1.2.3_beta5')).toBe('1.2.3');
    });
  });
});
