
let TestSuite = require("../../test-suite/index");
let Utils = require("../../utils/index");

let { Test } = TestSuite;
let { Release, NIEMObject } = require("niem-model");

/**
 * @private
 */
class NIEMObjectUnitTests {

  /**
   * @param {TestSuite} testSuite
   */
  constructor(testSuite) {
    this.testSuite = testSuite;

    /** @private */
    this.utils = new Utils(testSuite);
  }

  /**
   * Checks that the qualified property field of the object exists in the release.
   *
   * @param {Test} test
   * @param {NIEMObject[]} objects
   * @param {Release} release
   * @param {String} [qnameField="propertyQName"] Qualified property field to check
   */
  async property_unknown__helper(test, objects, release, qnameField="propertyQName") {

    return this.component_unknown__helper(test, objects, release, "properties", qnameField);

  }

  /**
   * Checks that the qualified type field of the object exists in the release.
   *
   * @param {Test} test
   * @param {NIEMObject[]} objects
   * @param {Release} release
   * @param {String} [qnameField="typeQName"] Qualified type field to check
   */
  async type_unknown__helper(test, objects, release, qnameField="typeQName") {

    return this.component_unknown__helper(test, objects, release, "types", qnameField);

  }


  /**
   * Checks that the qualified component field of the object exists in the release.
   *
   * @param {Test} test
   * @param {NIEMObject[]} objects
   * @param {Release} release
   * @param {"types"|"properties"} sourceField - Release object to search for component
   * @param {String} [qnameField="typeQName"] Qualified component field to check
   */
  async component_unknown__helper(test, objects, release, sourceField, qnameField) {

    test.start();

    /** @type {NIEMObject[]} */
    let problemObjects = [];

    /** @type {String[]} */
    let uniqueQNames = new Set( objects.map( object => object[qnameField]) );

    /** @type {String[]} */
    let undefinedQNames = [];

    // Only look up unique qnames; add to undefinedQNames array if not found
    for (let qname of uniqueQNames) {
      let component = await release[sourceField].get(qname);
      if (!component) undefinedQNames.push(qname);
    }

    undefinedQNames.forEach( qname => {
      let matches = objects.filter( object => object[qnameField] == qname );
      problemObjects.push(...matches);
    });

    return this.testSuite.post(test, problemObjects, qnameField);
  }

}

module.exports = NIEMObjectUnitTests;
