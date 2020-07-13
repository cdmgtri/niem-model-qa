
let QATestSuite = require("../../test-suite/index");
let debug = require("debug")("niem-qa");

process.env.DEBUG = "niem-*";
debug.enabled = true;

/**
 * @private
 */
class NIEMObjectQA {

  /**
   * @param {QATestSuite} testSuite
   */
  constructor(testSuite) {

    /**
     * Test suite with all tests for all objects
     */
    this.testSuite = testSuite;

    /**
     * Individual object tests
     */
    this.test = {};

    /**
     * Run all tests in the test suite
     */
    this.all;

    /**
     * Run tests in the test suite filtered on a particular object field
     */
    this.field = {};

  }

  /**
   * Run all unit tests for the given field.
   *
   * @private
   * @template T
   * @param {T[]} niemObjects
   * @param {Release} release
   * @param {String} [field] - Optional test filter for a given object field
   */
  async runTests(niemObjects, release, field) {

    /** @type {Test[]} */
    let tests = [];

    let testNames = this.fieldTestNames(field);

    for (let testName of testNames) {
      let test = await this.test[testName](niemObjects, release);
      tests.push(test);
    }

    debug(`Ran ${this.constructor.name.replace("QA", "")} tests`);

    return QATestSuite.init(tests);

  }

  /**
   * Find all unit test names for the given field.
   * @private
   * @param {String} [field] - Optional test filter for a given object field
   */
  fieldTestNames(field) {

    // Get all properties and methods from the unit test class
    let testsPrototype = Object.getPrototypeOf(this.test);
    let testFunctions = Object.getOwnPropertyNames(testsPrototype);

    if (!field) {
      // Return all unit tests, minus the constructor
      return testFunctions.filter( fn => fn != "constructor" );
    }

    // Return unit tests filtered on given field
    return testFunctions.filter( fn => fn.includes(field + "_") );

  }

}

module.exports = NIEMObjectQA;

let { Release, NIEMObject } = require("niem-model");