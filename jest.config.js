import { jestEsm } from '@darkobits/ts';

export default jestEsm({
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90
    }
  }
});
