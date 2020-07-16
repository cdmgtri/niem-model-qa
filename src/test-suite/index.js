
let chalk = require("chalk");
let { NIEMObject } = require("niem-model");

let Test = require("./test/index");
let Issue = require("./issue/index");
const NIEMModelQA = require("..");

/**
 * NIEM Test Suite
 */
class QATestSuite {

  /**
   * @param {NIEMModelQA} qa
   * @param {boolean} ignoreExceptions True if exceptions should not be added to the issue list
   */
  constructor(qa, ignoreExceptions=true) {

    this.qa = qa;

    this.ignoreExceptions = ignoreExceptions;

  }

  get tests() {
    return this.qa.tests;
  }

  /**
   * Print QA status to the console.
   * @param {String[]} prefixes
   */
  printStatus(prefixes) {

    /**
     * @typedef Details
     * @property {Test[]} tests
     * @property {string} symbol
     * @property {Function} chalkFunction
     * @property {string} heading
     * @property {number} issues
     */
    let DetailsType;

    let headerPadding = 10;

    /** @type {{passed: Details, errors: Details, warnings: Details, info: Details}} */
    let summary = {
      passed: {
        tests: this.qa.results.testsPassed(prefixes),
        symbol: chalk.green("\u2714 "),
        chalkFunction: chalk.green,
        heading: "Passed:".padEnd(headerPadding, " "),
      },
      errors: {
        tests: this.qa.results.testsFailedErrors(prefixes),
        symbol: chalk.red("\u2716 "),
        chalkFunction: chalk.red,
        heading: "Errors:".padEnd(headerPadding, " "),
        issues: this.qa.results.issues(prefixes, "error").length
      },
      warnings: {
        tests: this.qa.results.testsFailedWarnings(prefixes),
        symbol: chalk.yellow("? "),
        chalkFunction: chalk.yellow,
        heading: "Warnings:".padEnd(headerPadding, " "),
        issues: this.qa.results.issues(prefixes, "warning").length
      },
      info: {
        tests: this.qa.results.testsFailedInfo(prefixes),
        symbol: chalk.gray("\u2722 "),
        chalkFunction: chalk.gray,
        heading: "Info:".padEnd(headerPadding, " "),
        issues: this.qa.results.issues(prefixes, "info").length
      }
    }

    /**
     * @param {Test} test
     * @param {Details} details
     */
    function printTestSummaryLine(test, details) {
      let issueCount = "";
      if (test.issues.length > 0) {
        issueCount = `(${test.issues.length} issue${test.issues.length > 1 ? "s" : ""})`;
      }
      return `${details.symbol} ${test.id}  ${details.chalkFunction(issueCount)}`;
    }

    /**
     * @param {Details} details
     */
    function printSeverityTests(details) {
      if (details.tests.length == 0) return [];
      return details.tests
      .sort( (test1, test2) => test1.id.localeCompare(test2.id) )
      .map( test => printTestSummaryLine(test, details));
    }

    /**
     * @param {Details} details
     */
    function printSeveritySummary(details) {
      if (details.tests.length == 0) return;
      let severitySummary = `${details.tests.length} tests`.padStart(9, " ");
      let issueCount = details.issues ? `(${details.issues} issues)`.padStart(15, " ") : "";
      return `${details.symbol} ${details.heading} ${details.chalkFunction(severitySummary, issueCount)}`;
    }

    let severityTests = []
    .concat(printSeverityTests(summary.passed))
    .concat(printSeverityTests(summary.info))
    .concat(printSeverityTests(summary.warnings))
    .concat(printSeverityTests(summary.errors));

    let severitySummaries = [];
    severitySummaries.push(printSeveritySummary(summary.passed))
    severitySummaries.push(printSeveritySummary(summary.info))
    severitySummaries.push(printSeveritySummary(summary.warnings))
    severitySummaries.push(printSeveritySummary(summary.errors));

    let qaTestCount  = `${this.qa.tests.length} tests`;
    let qaIssueCount = `(${this.qa.results.issues().length} issues)`;

    console.log(`
    ---------------------------------------------------------------
      NIEM QA Results:
    ---------------------------------------------------------------
      ${severityTests.join("\n      ")}
    ---------------------------------------------------------------
      ${severitySummaries.filter( str => str ).join("\n      ")}
    ---------------------------------------------------------------
      QA Summary:    ${qaTestCount} ${qaIssueCount.padStart(15, " ")}
    `);

  }

  /**
   * Total test run times in seconds.
   */
  get runTime() {
    return this.qa.tests.reduce( (totalTime, test) => {
      let newTime = test.timeElapsedSeconds;
      return newTime ? totalTime + newTime : totalTime;
    }, 0);
  }

  /**
   * Starts the clock on a test or throws error if not found.
   * @param {string} testID
   */
  start(testID) {
    let test = QATestSuite.find(this.tests, testID);
    if (! test) throw new Error(`Test ${testID} not found`);
    test.timeStart = Date.now();
    return test;
  }

  /**
   * Logs a test with the given ID as having ran and pushes any given issues.
   *
   * Existing issues are not overwritten, so this may be called multiple
   * times if needed.
   *
   * @param {Test} test
   * @param {Issue[]} issues
   * @param {Boolean} [append=false] Append rather than replace current test issues.
   */
  log(test, issues, append=false) {
    return QATestSuite.log(this.tests, test.id, issues, append);
  }

  /**
   * Logs a test with the given ID as having ran and pushes any given issues.
   *
   * Existing issues are not overwritten, so this may be called multiple
   * times if needed.
   *
   * @param {Test[]} tests
   * @param {String} testID
   * @param {Issue[]} issues
   * @param {Boolean} [append=false] Append rather than replace current test issues.
   */
  static log(tests, testID, issues=[], append=false) {
    let test = QATestSuite.find(tests, testID, append);
    test.log(issues);
    return test;
  }

  // * @param {function(NIEMObject):string} commentFunction
  /**
   * Logs issues for the test.
   *
   * @param {Test} test
   * @param {NIEMObject[]} problemObjects
   * @param {String} problemField
   * @param {(object: NIEMObject) => string} commentFunction
   * @param {Boolean} [reset=true] Replaces any previous issues with new issues
   */
  post(test, problemObjects, problemField, commentFunction, reset=true) {

    if (reset == true) {
      // Remove any existing issues on the test
      test.issues = [];
    }

    /** @type {Issue[]} */
    let issues = [];

    // Process inputs into an array of issues
    problemObjects.forEach( object => {

      let label = object.label;
      let problemValue = object[problemField];
      let comment = commentFunction ? commentFunction(object) : "";

      // Replace full facet identifier with qualified type name
      // if (test.id.startsWith("facet")) label = object.typeQName;

      let isException = test.exceptionLabels.includes(object.label);

      if (!this.ignoreExceptions || !isException) {
        let issue = new Issue(object.authoritativePrefix, label, object.input_location, object.input_line, object.input_position, problemValue, comment);
        issues.push(issue);
      }

    });

    // Mark test as ran and load any issues
    test.log(issues);

    return test;

  }

  /**
   * Returns a test from the given set of tests with the given ID.
   *
   * @param {Test[]} tests
   * @param {String} testID
   */
  static find(tests, testID) {
    return tests.find( test => test.id == testID );
  }

  /**
   * Returns a test from the test suite with the given ID.

   * @param {String} testID
   */
  find(testID) {
    let test = QATestSuite.find(this.tests, testID);
    if (!test) {
      throw new Error(`Test '${testID}' not found in test suite.`);
    }
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

