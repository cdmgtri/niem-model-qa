
let TestSuite = require("../../test-suite");
let Utils = require("../../utils");

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

}

module.exports = NIEMObjectUnitTests;
