
let TestSuite = require("./test-suite/index");
let Test = require("./test");
let SpellChecker = require("./spellChecker");
let Utils = require("./utils/index");
let debug = require("debug")("niem-qa");

const QAReport = require("./test-suite/report/index");
const Tests = require("./tests");
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
    this._tests = [];

    this.testSuite = new TestSuite(this);
    this.spellChecker = new SpellChecker();

    this.tests = new Tests(this);
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
    this.tests.add(tests);

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
      fullQA._tests.push(...qaResults[key]._tests);
    }

    return fullQA;

  }

  /**
   * @param {Test[]} tests
   */
  static init(tests) {
    let qa = new NIEMModelQA();
    qa._tests.push(...tests);
    return qa;
  }

  /**
   * Convert a test metadata spreadsheet to JSON.  Defaults to model tests if no path given.
   *
   * @param {string} spreadsheetPath Path and file name of the test metadata spread.
   * @param {boolean} [reset=true] If path given, overwrite model tests (default); otherwise append tests
   */
  static async saveTestsAsJSON(spreadsheetPath, reset=true) {

    let qa = new NIEMModelQA();
    await qa.init();

    if (spreadsheetPath) {
      qa.tests.add(spreadsheetPath, reset);
    }
    else {
      let path = require("path");
      spreadsheetPath = path.resolve(__dirname, "niem-model-qa-tests.xlsx");
    }

    let outputPath = spreadsheetPath.replace(".xlsx", ".json");
    await qa.tests.save(outputPath)

  }

}

module.exports = NIEMModelQA;

const { Release } = require("niem-model");

