'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('generator-space-infra:workspace', () => {
  beforeAll(() => {
    return helpers
      .run(path.join(__dirname, '../generators/workspace'))
      .withPrompts({ someAnswer: true });
  });

  it('creates files', () => {
    assert.file(['dummyfile.txt']);
  });
});
