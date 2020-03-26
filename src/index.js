
let TestSuite = require("./test-suite/index");
let Test = require("./test-suite/test/index");
let Utils = require("./utils/index");
let debug = require("debug")("niem-qa");

process.env.DEBUG = "niem-*";
debug.enabled = true;

let PropertyQA = require("./property/index");
let TypeQA = require("./type/index");
let FacetQA = require("./facet/index");

let { Namespace, Component, Facet } = require("niem-model");

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

    let tests = TestMetadata.map( metadata => Object.assign(new Test(), metadata) );
    this.testSuite.loadTests(tests);

  }

  get testSuiteMetadata() {
    return this.testSuite.testSuiteMetadata;
  }

  /**
   * @param {Release} release
   */
  async init(release) {
    // Load the spellchecker library in utils
    await this.utils.init(release)
    debug("Initialized test suite");
  }

  /**
   * @param {string[]} words
   */
  async spellcheckAddWords(words) {
    return this.utils._spellChecker.addWords(words);
  }

  /**
   * @param {string[]} words
   */
  async spellcheckRemoveWords(words) {
    return this.utils._spellChecker.removeWords(words);
  }

  /**
   * @param {Release} release
   */
  async checkRelease(release) {

    // Load data
    let properties = await release.properties.find({});
    let types = await release.types.find();
    let facets = await release.facets.find();
    let namespaces = await release.namespaces.find();

    let conformantNamespaces = namespaces.filter( namespace => namespace.conformanceRequired );
    let conformantPrefixes = conformantNamespaces.map( namespace => namespace.prefix );

    // Exclude external properties from QA testing
    properties = properties.filter( property => conformantPrefixes.includes(property.prefix) );

    // Sort components
    properties = properties.sort(Component.sortByQName);
    types = types.filter( type => type.prefix != "xs" ).sort(Component.sortByQName);
    facets = facets.sort(Facet.sortFacetsByStyleAdjustedValueDefinition);
    namespaces = namespaces.sort(Namespace.sortByPrefix);

    /** @type {Object<string, TestSuite>} */
    let testSuites = {};

    // Run tests
    testSuites.property = await this.property.all(properties, release);
    testSuites.type = await this.type.all(types, release);
    testSuites.facet = await this.facet.all(facets, release);

    // Merge the results into a single test suite
    let fullTestSuite = new TestSuite();
    for (let key in testSuites) {
      fullTestSuite.tests.push(...testSuites[key].tests);
    }

    return fullTestSuite;

  }

  saveTestSuiteMetadata(filePath) {
    let fs = require("fs");
    let json = JSON.stringify(this.testSuiteMetadata, null, 2);
    fs.writeFileSync(filePath, json);
  }

  saveTestResults(filePath) {
    let fs = require("fs");
    let json = JSON.stringify(this.testSuite.tests, null, 2);
    fs.writeFileSync(filePath, json);
  }

  reloadTestResults(filePath) {
    let fs = require("fs");
    let data = fs.readFileSync(filePath, "utf8");

    /** @type {{}[]} */
    let json = JSON.parse(data);

    for (let testInfo of json) {
      let test = Object.assign(new Test(), testInfo);
      this.testSuite.tests.push(test)
    }

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
