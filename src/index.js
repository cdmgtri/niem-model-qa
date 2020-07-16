
let TestSuite = require("./test-suite/index");
let Test = require("./test-suite/test/index");
let SpellChecker = require("./spellChecker");
let Utils = require("./utils/index");
let debug = require("debug")("niem-qa");

const QAReport = require("./test-suite/report/index");
const TestMetadata = require("./testMetadata");
const QAResults = require("./results");

process.env.DEBUG = "niem-*";
debug.enabled = true;

let NamespaceQA = require("./model-tests/namespace/index");
let PropertyQA = require("./model-tests/property/index");
let TypeQA = require("./model-tests/type/index");
let FacetQA = require("./model-tests/facet/index");

let { Namespace, Component, Facet } = require("niem-model");

/** @type {Array} */
let ModelQaJSONTestData = require("../niem-model-qa-tests.json");

/**
 * @todo Full test suite for classes
 * @todo Full test suite for a release
 *
 * @todo Add link test info in QA app
 * @todo Create a NDR 3.0 version and implementation
 */
class NIEMModelQA {

  constructor() {

    /** @type {Test[]} */
    this.tests = [];

    this.testSuite = new TestSuite(this);
    this.spellChecker = new SpellChecker();

    this.testMetadata = new TestMetadata(this);
    this.results = new QAResults(this);
    this.report = new QAReport(this.testSuite);

    let utils = new Utils(this);
    this.namespace = new NamespaceQA(this.testSuite, utils);
    this.property = new PropertyQA(this.testSuite, utils);
    this.type = new TypeQA(this.testSuite, utils);
    this.facet = new FacetQA(this.testSuite, utils);

  }

  /**
   * @param {Release} release
   */
  async init(release) {
    // Convert ModelQA tests saved as JSON data into test objects and load
    let tests = ModelQaJSONTestData.map( metadata => Object.assign(new Test(), metadata) );
    this.testMetadata.add(tests);

    // Initialize the spell checker
    await this.spellChecker.init(release);
    debug("Initialized test suite");
  }

  /**
   * @param {Release} release
   */
  async checkRelease(release) {

    // Load data
    let namespaces = await release.namespaces.find();
    let properties = await release.properties.find({});
    let types = await release.types.find();
    let facets = await release.facets.find();

    let conformantNamespaces = namespaces.filter( namespace => namespace.conformanceRequired );
    let conformantPrefixes = conformantNamespaces.map( namespace => namespace.prefix );

    // Exclude external properties from QA testing
    properties = properties.filter( property => conformantPrefixes.includes(property.prefix) );

    // Sort components
    namespaces = namespaces.sort(Namespace.sortByPrefix);
    properties = properties.sort(Component.sortByQName);
    types = types.filter( type => type.prefix != "xs" && type.prefix != "structures" ).sort(Component.sortByQName);
    facets = facets.sort(Facet.sortFacetsByStyleAdjustedValueDefinition);

    /** @type {Object<string, NIEMModelQA>} */
    let qaResults = {};

    // Run tests
    qaResults.namespace = await this.namespace.all(conformantNamespaces, release);
    qaResults.property = await this.property.all(properties, release);
    qaResults.type = await this.type.all(types, release);
    qaResults.facet = await this.facet.all(facets, release);

    // Merge the results into a single test suite
    let fullQA = new NIEMModelQA();
    for (let key in qaResults) {
      fullQA.tests.push(...qaResults[key].tests);
    }

    return fullQA;

  }

  /**
   * @param {Test[]} tests
   */
  static init(tests) {
    let qa = new NIEMModelQA();
    qa.tests.push(...tests);
    return qa.testSuite;
  }

  /**
   * Convert a test metadata spreadsheet to JSON.  Defaults to model tests if no path given.
   * @param {string} spreadsheetFilePath Path and file name of the test metadata spread.
   */
  static async updateTestSuiteJSON(spreadsheetFilePath) {

    if (!spreadsheetFilePath) {
      // Default to this project's model test spreadsheet
      let path = require("path");
      let currentPath = path.resolve(__dirname, "../");
      spreadsheetFilePath = currentPath + "/niem-model-qa-tests"
    }

    // Import test spreadsheet metadata
    let testSuite = new TestSuite();
    await testSuite.loadTestSpreadsheet(spreadsheetFilePath + ".xlsx");

    // Save test metadata to JSON file
    let fs = require("fs");
    let json = JSON.stringify(testSuite.testSuiteMetadata, null, 2);
    fs.writeFileSync(spreadsheetFilePath + ".json", json);
  }

}

module.exports = NIEMModelQA;

const { Release } = require("niem-model");

