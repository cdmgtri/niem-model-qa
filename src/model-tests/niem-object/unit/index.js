
let TestSuite = require("../../../test-suite/index");
let Utils = require("../../../utils");

/**
 * @private
 */
class NIEMObjectUnitTests {

  /**
   * @param {TestSuite} testSuite
   * @param {Utils} utils
   */
  constructor(testSuite, utils) {
    this.testSuite = testSuite;

    /** @private */
    this.utils = utils;
  }

}

module.exports = NIEMObjectUnitTests;
