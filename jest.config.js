module.exports = require('@darkobits/ts-unified/dist/config/jest')({
  coverageThreshold: {
    global: {
      statements: 25,
      branches: 25,
      functions: 25,
      lines: 25
    }
  }
});
