
let debug = require("debug")("niem-qa");

process.env.DEBUG = "niem-*";
debug.enabled = true;

/**
 * @private
 */
class NIEMObjectTester {

  /**
   * @param {NIEMModelQA} qa
   */
  constructor(qa) {

    /**
     * QA with all tests for all objects
     */
    this.qa = qa;

    /**
     * Individual object tests
     */
    this.tests = {};

    /**
     * Run all tests in the test suite
     */
    this.run;

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

    let NIEMModelQA = require("../../index");
    let qa = new NIEMModelQA();

    /** @type {Test[]} */
    let tests = [];

    // Get function names from the Tester class to be run as tests
    let testNames = this.fieldTestNames(field);

    // Add an update to the progress tracker
    let label = this.constructor.name.replace("Tester", "");
    let update = this.qa.startUpdate(label, null, testNames.length);

    // Run and log tests
    for (let testName of testNames) {
      let test = await this.tests[testName](niemObjects, release);
      tests.push(test);
    }

    debug(`Ran ${this.constructor.name.replace("QA", "")} tests`);

    // Close out the progress tracker update
    let passed = tests.filter(test => test.passed.length);
    update.end(passed);

    qa.tests.add(tests);
    return qa;

  }

  /**
   * Find all unit test names for the given field.
   * @private
   * @param {String} [field] - Optional test filter for a given object field
   */
  fieldTestNames(field) {

    let testFunctionNames = [];
    let testClass = Object.getPrototypeOf(this.tests);

    while (testClass.constructor.name != "Object") {
      // Get all properties and methods from the unit test class
      testFunctionNames.push( ...Object.getOwnPropertyNames(testClass) );

      // Loop over parent class for more tests
      testClass = Object.getPrototypeOf(testClass);
    }

    testFunctionNames = testFunctionNames.filter( name => name != "constructor" && ! name.startsWith("__") );

    if (field) {
      // Return unit tests filtered on the given field
      return testFunctionNames.filter( name => name.includes(field + "_") );
    }

    // Return all unit tests
    return testFunctionNames;

  }

}

module.exports = NIEMObjectTester;

let { Release } = require("niem-model");
let NIEMModelQA = require("../../index");
let Test = require("../../test");
