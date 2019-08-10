
let TestSuite = require("./test-suite/index");

let { Test, Issue } = TestSuite;

let TypeQA = require("./type/index");

/**
 * @todo Add link to relevant niem.github.io concept
 * @todo Add docs search box
 * @todo Figure out where to put examples
 * @todo Create a NDR 3.0 version and implementation
 * @todo Export spreadsheet test suite info to JSON file for easy reuse
 * @todo JSDoc link to JSON property?
 * @todo Check that field tests include all relevant unit tests
 * @todo Full test suite for classes
 * @todo Full test suite for a release
 */
class NIEMModelQA {

  constructor() {

    this.testSuite = new TestSuite();

    this.type = new TypeQA(this.testSuite);

  }

  async loadTests() {
    await this.testSuite.loadTests("niem-model-qa-tests.xlsx");
  }

}

NIEMModelQA.Test = Test;
NIEMModelQA.Issue = Issue;

module.exports = NIEMModelQA;
