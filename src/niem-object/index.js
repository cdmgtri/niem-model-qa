
let NIEMTestSuite = require("niem-test-suite");
let { ModelObjects } = require("niem-model-source");

let { Test, Issue } = NIEMTestSuite;

/**
 * @private
 */
class NIEMObjectQA {

  /**
   * @param {NIEMTestSuite} testSuite
   */
  constructor(testSuite) {
    this.testSuite = testSuite;
  }

}

NIEMObjectQA.ModelObjects = ModelObjects;
NIEMObjectQA.TestSuite = NIEMTestSuite;
NIEMObjectQA.Test = Test;
NIEMObjectQA.Issue = Issue;

module.exports = NIEMObjectQA;
