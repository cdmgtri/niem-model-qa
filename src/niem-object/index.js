
let NIEMTestSuite = require("niem-test-suite");
let { ModelObjects } = require("niem-model-source");
let { NIEMObject } = require("niem-model-objects");

let { Release } = ModelObjects;
let { Test, Issue } = NIEMTestSuite;

class NIEMObjectQA {

  /**
   * @param {NIEMTestSuite} testSuite
   */
  constructor(testSuite) {
    this.testSuite = testSuite;
  }

  /**
   * @param {Release} release
   * @param {NIEMObject[]} niemObjects
   * @returns {Test[]}
   */
  async run(release, niemObjects) {
    let localTests = this.unitTests(niemObjects);
    let refTests = await this.referenceTests(release, niemObjects);
    return [...localTests, ...refTests];
  }

  /**
   * @param {NIEMObject[]} niemObjects
   * @returns {Test[]}
   */
  unitTests(niemObjects) {
    return undefined;
  }

  /**
   * @param {Release} release
   * @param {NIEMObject[]} niemObjects
   * @returns {Test[]}
   */
  async referenceTests(release, niemObjects) {
    return undefined;
  }

}

NIEMObjectQA.ModelObjects = ModelObjects;
NIEMObjectQA.TestSuite = NIEMTestSuite;
NIEMObjectQA.Test = Test;
NIEMObjectQA.Issue = Issue;

module.exports = NIEMObjectQA;
