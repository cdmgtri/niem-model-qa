
let TestSuite = require("./test-suite/index");

let { Test, Issue } = TestSuite;

let TypeQA = require("./type/index");

/**
 * @todo Check that field tests include all relevant unit tests
 * @todo Full test suite for classes
 * @todo Full test suite for a release
 *
 * @todo Add link test info in QA app
 * @todo Create a NDR 3.0 version and implementation
 */
class NIEMModelQA {

  constructor() {

    this.testSuite = new TestSuite();

    this.type = new TypeQA(this.testSuite);

  }

  async loadTests() {
    await this.testSuite.loadTestSpreadsheet("niem-model-qa-tests.xlsx");
  }

  get testSuiteMetadata() {
    return this.testSuite.testSuiteMetadata;
  }

  saveTestSuiteMetadata(filePath) {
    let fs = require("fs");
    let json = JSON.stringify(this.testSuiteMetadata, null, 2);
    fs.writeFileSync(filePath, json);
  }

}

NIEMModelQA.Test = Test;
NIEMModelQA.Issue = Issue;

module.exports = NIEMModelQA;
