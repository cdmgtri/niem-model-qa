
let TestSuite = require("./test-suite/index");
let Test = require("./test-suite/test/index");
let Utils = require("./utils/index");

let PropertyQA = require("./property/index");
let TypeQA = require("./type/index");
let FacetQA = require("./facet/index");

/** @type {Array} */
let TestMetadata = require("../niem-model-qa-tests.json");

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
    this.utils = new Utils(this.testSuite);

    this.property = new PropertyQA(this.testSuite, this.utils);
    this.type = new TypeQA(this.testSuite, this.utils);
    this.facet = new FacetQA(this.testSuite, this.utils);

    // let tests = TestMetadata.map( metadata => Object.assign(new Test(), metadata) );
    // this.testSuite.loadTests(tests);

  }

  get testSuiteMetadata() {
    return this.testSuite.testSuiteMetadata;
  }

  async init() {
    // Load the spellchecker library in utils
    await this.utils.init()
  }

  /**
   * @param {Release} release
   */
  async checkRelease(release) {

    // Load data
    let properties = await release.properties.find();
    let types = await release.types.find();
    let facets = await release.facets.find();

    /** @type {Object<string, TestSuite>} */
    let testSuites = {};

    // Run tests
    testSuites.property = await this.property.all(properties, release);
    testSuites.type = await this.type.all(types, release);
    testSuites.facet = await this.facet.all(facets, release);

    // Merge the results into a single test suite
    let fullTestSuite = new TestSuite();
    for (let key in testSuites) {
      fullTestSuite.tests.push(testSuites[key].tests);
    }

    return fullTestSuite;

  }

  saveTestSuiteMetadata(filePath) {
    let fs = require("fs");
    let json = JSON.stringify(this.testSuiteMetadata, null, 2);
    fs.writeFileSync(filePath, json);
  }

  static async updateTestSuiteJSON() {

    let path = require("path");
    let currentPath = path.resolve(__dirname, "../");

    let testSuite = new TestSuite();

    // Import test spreadsheet metadata
    await testSuite.loadTestSpreadsheet(currentPath + "/niem-model-qa-tests.xlsx");

    // Save test metadata to JSON file
    let fs = require("fs");
    let json = JSON.stringify(testSuite.testSuiteMetadata, null, 2);
    fs.writeFileSync(currentPath + "/niem-model-qa-tests.json", json);
  }

}

module.exports = NIEMModelQA;

let { Release } = require("niem-model");
