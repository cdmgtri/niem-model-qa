
let NIEMTestSuite = require("niem-test-suite");
let { NIEMObject } = require("niem-model-objects");

let { Test, Issue } = NIEMTestSuite;

class QATestSuite extends NIEMTestSuite {

  /**
   * Logs issues for the test.
   *
   * @param {String} testID
   * @param {NIEMObject[]} problemObjects
   * @param {String} problemField
   * @param {CommentFunction} commentFunction
   * @param {Boolean} [reset=true] Replaces any previous issues with new issues
   */
  log(testID, problemObjects, problemField, commentFunction, reset=true) {

    let test = this.find(testID);

    if (!test) {
      throw new Error(`Test ${testID} not found.`);
    }

    if (reset == true) {
      // Remove any existing issues on the test
      test._issues = [];
    }

    // Process inputs into an array of issues
    let issues = problemObjects.map( object => {

      let problemValue = object[problemField];
      let comment = commentFunction ? commentFunction(problemValue) : "";

      return new Issue(object.authoritativePrefix, object.label, object.source_location, object.source_line, object.source_position, problemValue, comment);

    });

    // Mark test as ran and load any issues
    test.log(issues);

    return test;

  }

  /**
   * @param {Test[]} tests
   */
  static init(tests) {
    let testSuite = new QATestSuite();
    testSuite.tests.push(...tests);
    return testSuite;
  }

}

/**
 * @callback CommentFunction
 * @param {String} problemValue
 * @returns {String}
 */
let CommentFunctionType;

module.exports = QATestSuite;
