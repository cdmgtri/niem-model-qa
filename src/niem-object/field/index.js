
let QATestSuite = require("../../test-suite/index");
let NIEMObjectUnitTests = require("../unit/index");

let { Test } = QATestSuite;
let { Release, NIEMObject } = require("niem-model");

class NIEMObjectFieldTests {

  /**
   * @param {NIEMObjectUnitTests} unitTests
   */
  constructor(unitTests) {
    this.unitTests = unitTests;
  }

  /**
   * @param {NIEMObject[]} niemObjects
   * @param {Release} release
   */
  async all(niemObjects, release) {
    return this.testSuite(niemObjects, release);
  }

  /**
   * Find all unit tests for the given field; or all unit tests if no field provided.
   *
   * @private
   * @param {String} field
   */
  _fieldTests(field) {

    // Get all properties and methods from the unit test class
    let unitTestPrototype = Object.getPrototypeOf(this.unitTests);
    let unitTestProperties = Object.getOwnPropertyNames(unitTestPrototype);

    if (!field) {
      // Return all unit tests, minus the constructor
      return unitTestProperties.filter( property => property != "constructor" );
    }

    // Return unit tests filtered on given field
    return unitTestProperties.filter( property => property.includes(field + "_") );

  }

  /**
   * Run all unit tests for the given field.
   *
   * @private
   * @param {NIEMObject[]} niemObjects
   * @param {Release} release
   * @param {String} field
   */
  async testSuite(niemObjects, release, field) {

    let unitTestFunctions = this._fieldTests(field);

    /** @type {Test[]} */
    let tests = [];

    for (let fn of unitTestFunctions) {
      let test = await this.unitTests[fn](niemObjects, release);
      tests.push(test);
    }

    return QATestSuite.init(tests);

  }

}

module.exports = NIEMObjectFieldTests;
