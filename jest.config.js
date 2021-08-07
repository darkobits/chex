import { jest } from '@darkobits/ts';

export default jest({
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90
    }
  }
});
