
const debug = require("debug")("niem-qa");

process.env.DEBUG = "niem-*";
debug.enabled = true;

const Test = require("./test");
const Utils = require("./utils/index");
const SpellChecker = require("./utils/spellChecker");
const QATerminal = require("./utils/terminal");

const QAReport = require("./report");
const QAResults = require("./results");
const Update = require("./update");
const Tests = require("./tests");

let NamespaceTester = require("./model-tests/namespace/index");
let LocalTermTester = require("./model-tests/localTerm/index");
let PropertyTester = require("./model-tests/property/index");
let TypeTester = require("./model-tests/type/index");
let FacetTester = require("./model-tests/facet/index");
let SubPropertyTester = require("./model-tests/subProperty/index");

let { Release, Namespace, LocalTerm, Component, Property, Type, SubProperty, Facet } = require("niem-model");

/** @type {Array} */
let JSONTests = require("../niem-model-qa-tests.json");

/**
 * @todo Full test suite for classes
 * @todo Full test suite for a release
 *
 * @todo Add link test info in QA app
 * @todo Create a NDR 3.0 version and implementation
 */
class NIEMModelQA {

  constructor() {

    /**
     * @private
     * @type {Test[]}
     */
    this._tests = [];

    /** @private */
    this._releaseData = {

      /** @type {Namespace[]} */
      namespaces: [],

      /** @type {LocalTerm[]} */
      localTerms: [],

      /** @type {Property[]} */
      properties: [],

      /** @type {Type[]} */
      types: [],

      /** @type {SubProperty[]} */
      subProperties: [],

      /** @type {Facet[]} */
      facets: []
    };

    /** @type {Update[]} */
    this.updates = [];

    this.ignoreExceptions = true;

    this.tests = new Tests(this);
    this.results = new QAResults(this);
    this.report = new QAReport(this);
    this.terminal = new QATerminal(this);

    this.utils = new Utils(this);
    this.spellChecker = new SpellChecker();

    this.objects = {
      namespace: new NamespaceTester(this),
      localTerm: new LocalTermTester(this),
      property: new PropertyTester(this),
      type: new TypeTester(this),
      facet: new FacetTester(this),
      subProperty: new SubPropertyTester(this)
    }

  }

  /**
   * @param {Release} release
   */
  async init(release) {
    // Convert ModelQA tests saved as JSON data into test objects and load
    let tests = JSONTests.map( metadata => Object.assign(new Test(), metadata) );
    this.tests.add(tests);

    // Initialize the spell checker
    await this.spellChecker.init(release);
    debug("Initialized test suite");
  }

  /**
   * Runs all tests
   *
   * @param {Release} release
   * @param {boolean} [reset=true] True (default) to reset any existing test results
   * @param {boolean} [ignoreExceptions=false] True (default) to ignore exceptions; false return all results
   */
  async run(release, reset=true, ignoreExceptions=true) {

    if (!release) {
      console.log("A release must be provided");
      return;
    }

    if (reset) this.tests.reset();
    this.ignoreExceptions = ignoreExceptions;

    // Load and sort data
    this._releaseData.namespaces = await release.namespaces.find({}, Namespace.sortByPrefix);
    this._releaseData.localTerms = await release.localTerms.find({}, LocalTerm.sortByPrefixTerm);
    this._releaseData.properties = await release.properties.find({}, Component.sortByQName);
    this._releaseData.types = await release.types.find({}, Component.sortByQName);
    this._releaseData.subProperties = await release.subProperties.find();
    this._releaseData.facets = await release.facets.find({}, Facet.sortFacetsByStyleAdjustedValueDefinition);

    // Filter data to remove non-conformant objects
    let conformantNamespaces = this._releaseData.namespaces.filter( namespace => namespace.conformanceRequired );
    let conformantPrefixes = conformantNamespaces.map( namespace => namespace.prefix );
    let properties = this._releaseData.properties.filter(property => conformantPrefixes.includes(property.prefix));
    let types = this._releaseData.types.filter( type => type.prefix != "xs" && type.prefix != "structures" )

    // Run tests
    await this.objects.namespace.run(conformantNamespaces, release);
    await this.objects.localTerm.run(this._releaseData.localTerms, release);
    await this.objects.property.run(properties, release);
    await this.objects.type.run(types, release);
    await this.objects.facet.run(this._releaseData.facets, release);
    await this.objects.subProperty.run(this._releaseData.subProperties, release);

    debug(`Spellchecked ${this.utils.spellChecker.count.toLocaleString()} words`);
    debug("Ran QA tests");

  }

  /**
   * Convert a test metadata spreadsheet to JSON.  Defaults to model tests if no path given.
   *
   * @param {string} spreadsheetPath Path and file name of the test metadata spread.
   * @param {boolean} [reset=true] If path given, overwrite model tests (default); otherwise append tests
   */
  static async exportTests(spreadsheetPath, reset=true) {

    let qa = new NIEMModelQA();
    await qa.init();

    if (spreadsheetPath) {
      await qa.tests.loadSpreadsheet(spreadsheetPath, reset);
    }
    else {
      let path = require("path");
      spreadsheetPath = path.resolve(__dirname, "niem-model-qa-tests.xlsx");
    }

    let outputPath = spreadsheetPath.replace(".xlsx", ".json");
    await qa.tests.save(outputPath)

  }

  /**
   * Adds a new update to the progress tracker.
   *
   * @param {String} label
   * @param {String} description
   * @param {number} testCount
   */
  startUpdate(label, description, testCount) {
    let update = new Update("in progress", label, description, testCount);
    this.updates.push(update);
    return update;
  }

}


module.exports = NIEMModelQA;
