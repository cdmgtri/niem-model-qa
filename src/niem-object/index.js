
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

  /**
   * Logs issues for the test.
   *
   * @param {String} testID
   * @param {NIEMObject[]} problemObjects
   * @param {String} problemField
   * @param {CommentFunction} commentFunction
   */
  logIssues(testID, problemObjects, problemField, commentFunction) {

    if (! this.testSuite.loggingEnabled || ! problemObjects) return;

    let test = this.testSuite.find(testID);

    if (!test) {
      throw new Error(`Test ${testID} not found.`);
    }

    let issues = problemObjects.map( object => {
      let problemValue = object[problemField];
      let comment = commentFunction ? commentFunction(problemValue) : "";

      return new Issue(object.authoritativePrefix, object.label, object.source_location, object.source_line, object.source_position, problemValue, comment);
    });

    test.log(issues);

    return test;

  }

}

/**
 * @callback CommentFunction
 * @param {String} problemValue
 * @returns {String}
 */
let CommentFunctionType;

NIEMObjectQA.ModelObjects = ModelObjects;
NIEMObjectQA.TestSuite = NIEMTestSuite;
NIEMObjectQA.Test = Test;
NIEMObjectQA.Issue = Issue;

module.exports = NIEMObjectQA;
