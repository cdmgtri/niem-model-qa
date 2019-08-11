
let QATestSuite = require("../test-suite");
let { ModelObjects } = require("niem-model-source");

let NIEMObjectUnitTests = require("./unit/index");
let NIEMObjectFieldTestSuites = require("./field/index");

let { Test, Issue } = QATestSuite;

/**
 * @private
 */
class NIEMObjectQA {

  /**
   * @param {QATestSuite} testSuite
   */
  constructor(testSuite) {
    this.testSuite = testSuite;
  }

  /**
   * @type {NIEMObjectUnitTests}
   */
  get test() {
    return undefined;
  }

  /**
   * @type {NIEMObjectFieldTestSuites}
   */
  get field() {
    return undefined;
  }

}

NIEMObjectQA.ModelObjects = ModelObjects;
NIEMObjectQA.TestSuite = QATestSuite;
NIEMObjectQA.Test = Test;
NIEMObjectQA.Issue = Issue;

module.exports = NIEMObjectQA;
