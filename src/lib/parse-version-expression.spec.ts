import parseVersionExpression from './parse-version-expression';


describe('parseVersionExpression', () => {
  describe('when provided no version range', () => {
    it('should return the name only', () => {
      expect(parseVersionExpression('foo')).toMatchObject({
        name: 'foo'
      });
    });
  });

  describe('when provided a version range', () => {
    describe('that is valid', () => {
      expect(parseVersionExpression('foo ^10.2.10')).toMatchObject({
        name: 'foo',
        versionRange: '^10.2.10'
      });

      expect(parseVersionExpression('foo >=10.0.0')).toMatchObject({
        name: 'foo',
        versionRange: '>=10.0.0'
      });
    });

    describe('that is invalid', () => {
      it('should throw an error', () => {
        expect(() => {
          parseVersionExpression('foo bar');
        }).toThrow();

        expect(() => {
          parseVersionExpression('foo 12.04.01');
        }).toThrow();
      });
    });
  });
});
