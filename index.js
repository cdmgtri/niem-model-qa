
let TestSuite = require("./src/test-suite/index");

let { Test, Issue } = TestSuite;

let TypeQA = require("./src/type/index");
let FacetQA = require("./src/facet/index");

/**
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
    this.facet = new FacetQA(this.testSuite);

  }

  get testSuiteMetadata() {
    return this.testSuite.testSuiteMetadata;
  }

  async loadTests() {
    await this.testSuite.loadTestSpreadsheet(__dirname + "/niem-model-qa-tests.xlsx");
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
