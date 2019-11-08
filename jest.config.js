module.exports = require('@darkobits/ts-unified/dist/config/jest')({
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 30,
      functions: 50,
      lines: 50
    }
  }
});
