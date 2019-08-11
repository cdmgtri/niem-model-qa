
let { Release, Type } = require("niem-model-source").ModelObjects;

let TypeQA_UnitTests = require("../unit/index");
let QATestSuite = require("../../test-suite/index");

let { Test } = QATestSuite;

let fields = ["base", "definition", "name", "prefix", "s"]

/**
 * @todo Refactor common functionality into a parent type
 */
class TypeQA_FieldTestSuites {

  /**
   * @param {TypeQA_UnitTests} unitTests
   */
  constructor(unitTests) {
    this.unitTests = unitTests;
  }

  /**
   * @param {Type[]} types
   * @param {Release} release
   */
  async base(types, release) {
    return runFieldTestSuite(this.unitTests, types, release, "base");
  }

  /**
   * @param {Type[]} types
   * @param {Release} release
   */
  async def(types, release) {
    return runFieldTestSuite(this.unitTests, types, release, "def");
  }

  /**
   * @param {Type[]} types
   * @param {Release} release
   */
  async name(types, release) {
    return runFieldTestSuite(this.unitTests, types, release, "name");
  }

  /**
   * @param {Type[]} types
   * @param {Release} release
   */
  async prefix(types, release) {
    return runFieldTestSuite(this.unitTests, types, release, "prefix");
  }

  /**
   * @param {Type[]} types
   * @param {Release} release
   */
  async style(types, release) {
    return runFieldTestSuite(this.unitTests, types, release, "style");
  }

  /**
   * @param {Type[]} types
   * @param {Release} release
   */
  async all(types, release) {
    return runFieldTestSuite(this.unitTests, types, release);
  }

  /**
   * @param {Type[]} types
   * @param {Release} release
   * @param {String} field
   * @returns {Promise<QATestSuite></QATestSuite>}
   */
  async getTestSuite(types, release, field) {

    if (field && this[field]) {
      // Return test suite with unit tests for the given field
      return this[field](types, release);
    }

    // Return test suite with all unit tests
    return this.all(types, release);
  }

}

/**
 * Find all unit tests for the given field.
 *
 * @private
 * @param {TypeQA_UnitTests} unitTests
 * @param {String} field
 */
function getFieldTests(unitTests, field) {

  // Get all properties and methods from the unit test class
  let fieldTests = Object.getOwnPropertyNames(Object.getPrototypeOf(unitTests));

  if (!field) {
    // Return all unit tests, minus the constructor
    return fieldTests.filter( property => property != "constructor" );
  }

  // Return unit tests filtered on given field
  return fieldTests.filter( property => property.includes(field + "_") );

}

/**
 * Run all unit tests for the given field.
 *
 * @private
 * @param {TypeQA_UnitTests} unitTests
 * @param {Type[]} types
 * @param {Release} release
 * @param {String} field
 */
async function runFieldTestSuite(unitTests, types, release, field) {

  let testFunctions = getFieldTests(unitTests, field);

  /** @type {Test[]} */
  let tests = [];

  for (let fn of testFunctions) {
    let test = await unitTests[fn](types, release);
    tests.push(test);
  }

  return QATestSuite.init(tests);

}

module.exports = TypeQA_FieldTestSuites;
