
let TestSuite = require("./src/test-suite/index");

let { Test, Issue } = TestSuite;

let PropertyQA = require("./src/property/index");
let TypeQA = require("./src/type/index");
let FacetQA = require("./src/facet/index");

/** @type {Array} */
let TestMetadata = require("./niem-model-qa-tests.json");

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

    this.property = new PropertyQA(this.testSuite);
    this.type = new TypeQA(this.testSuite);
    this.facet = new FacetQA(this.testSuite);

    let tests = TestMetadata.map( metadata => Object.assign(new Test(), metadata) );
    this.testSuite.loadTests(tests);

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

  static async updateTestSuiteJSON() {

    let testSuite = new TestSuite();

    // Import test spreadsheet metadata
    await testSuite.loadTestSpreadsheet("./niem-model-qa-tests.xlsx");

    // Save test metadata to JSON file
    let fs = require("fs");
    let json = JSON.stringify(testSuite.testSuiteMetadata, null, 2);
    fs.writeFileSync("./niem-model-qa-tests.json", json);
  }

}

NIEMModelQA.Test = Test;
NIEMModelQA.Issue = Issue;

module.exports = NIEMModelQA;
