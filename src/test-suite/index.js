
let NIEMTestSuite = require("niem-test-suite");
let { NIEMObject } = require("niem-model");

let { Test, Issue } = NIEMTestSuite;

class QATestSuite extends NIEMTestSuite {

  /**
   * Starts the clock on a test or throws error if not found.
   * @param {string} testID
   */
  start(testID) {
    let test = super.start(testID);
    if (! test) throw new Error(`Test ${testID} not found`);
    return test;
  }

  /**
   * @param {Test} test
   * @param {Issue[]} issues
   */
  log(test, issues) {
    return super.log(test.id, issues);
  }

  /**
   * Logs issues for the test.
   *
   * @param {Test} test
   * @param {NIEMObject[]} problemObjects
   * @param {String} problemField
   * @param {CommentFunction} commentFunction
   * @param {Boolean} [reset=true] Replaces any previous issues with new issues
   */
  post(test, problemObjects, problemField, commentFunction, reset=true) {

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

}

/**
 * @private
 * @callback CommentFunction
 * @param {String} problemValue
 * @returns {String}
 */
let CommentFunctionType;

module.exports = QATestSuite;
