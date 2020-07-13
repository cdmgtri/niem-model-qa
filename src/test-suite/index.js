
let xlsx = require("xlsx-populate");
let chalk = require("chalk");
let { NIEMObject } = require("niem-model");

let Test = require("./test/index");
let Issue = require("./issue/index");
let Report = require("./report/index");

/** @type {Array} */
let TestMetadata = require("../../niem-model-qa-tests.json");

/**
 * NIEM Test Suite
 */
class QATestSuite {

  /**
   * @param {boolean} ignoreExceptions True if exceptions should not be added to the issue list
   */
  constructor(ignoreExceptions=true) {

    /** @type {Test[]} */
    this.tests = [];

    this.report = new Report(this);

    this.ignoreExceptions = ignoreExceptions;

  }

  /**
   * @param {Test[]} tests
   */
  static init(tests) {
    let testSuite = new QATestSuite();
    testSuite.tests.push(...tests);
    return testSuite;
  }

  /**
   * Resets each test status back to its initial state and removes all issues.
   */
  reset() {
    this.tests.forEach( test => test.reset() );
  }

  /**
   * @param {String} filePath
   */
  static async loadTestSpreadsheet(filePath) {

    /** @type {Test[]} */
    let tests = [];

    // Get rows of given spreadsheet with test metadata
    let workbook = await xlsx.fromFileAsync(filePath);
    let rows = workbook.sheet(0).usedRange().value();

    // Remove the column header row and convert rows to tests
    rows.splice(0, 1);
    rows.forEach( row => tests.push(new Test(...row) ) );

    return tests;

  }

  /**
   * @param {String} filePath
   * @param {boolean} reset Overwrite existing tests if true
   */
  async loadTestSpreadsheet(filePath, reset=true) {
    if (reset) this.tests = [];
    let tests = await QATestSuite.loadTestSpreadsheet(filePath);
    return this.loadTests(tests);
  }

  /**
   * @param {boolean} reset Overwrite existing tests if true
   */
  loadModelTests(reset=true) {
    if (reset) this.tests = [];
    let tests = TestMetadata.map( metadata => Object.assign(new Test(), metadata) );
    this.loadTests(tests);
  }

  /**
   * Loads test objects into the test suite.
   * @param {Test[]} tests
   */
  loadTests(tests) {
    this.tests.push(...tests);
    return tests;
  }

  /**
   * All tests that have been run.
   */
  get testsRan() {
    return this.tests.filter( test => test.ran );
  }

  /**
   * All tests that have not been run.
   * This could be because test metadata exists in the test spreadsheet but a corresponding test
   * has not yet been implemented.
   */
  get testsNotRan() {
    return this.tests.filter( test => ! test.ran );
  }

  /**
   * Tests that have passed, with results optionally filtered by the given namespace prefixes.
   * @param {String[]} prefixes
   */
  testsPassed(prefixes) {
    return this.testsRan.filter( test => test.namespacesPassed(prefixes) );
  }

  /**
   * Tests that have failed, with results optionally filtered by the given namespace prefixes.
   * @param {String[]} prefixes - Optional filter on issue prefix
   * @param {Test.SeverityType[]} severities - Optional filter on test severity
   */
  testsFailed(prefixes, severities) {
    let failedTests = this.testsRan.filter( test => test.namespacesFailed(prefixes) );

    if (severities) {
      return failedTests.filter( test => severities.includes(test.severity) );
    }

    return failedTests;
  }

  /**
   * @param {String[]} prefixes
   */
  testsFailedErrors(prefixes) {
    return this.testsFailed(prefixes, ["error"]);
  }

  /**
   * @param {String[]} prefixes
   */
  testsFailedWarnings(prefixes) {
    return this.testsFailed(prefixes, ["warning"]);
  }

  /**
   * @param {String[]} prefixes
   */
  testsFailedInfo(prefixes) {
    return this.testsFailed(prefixes, ["info"]);
  }

  /**
   * @param {String[]} prefixes
   */
  passed(prefixes) {
    return this.testsFailed(prefixes).length == 0 && this.testsRan.length > 0;
  }

  /**
   * @param {String[]} prefixes
   */
  failed(prefixes) {
    return this.testsFailed(prefixes).length > 0;
  }

  /**
   * @param {String[]} prefixes
   */
  status(prefixes) {
    if (this.passed(prefixes)) return "pass";
    if (this.failed(prefixes)) return "fail";
    return "not ran";
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
        tests: this.testsPassed(prefixes),
        symbol: chalk.green("\u2714 "),
        chalkFunction: chalk.green,
        heading: "Passed:".padEnd(headerPadding, " "),
      },
      errors: {
        tests: this.testsFailedErrors(prefixes),
        symbol: chalk.red("\u2716 "),
        chalkFunction: chalk.red,
        heading: "Errors:".padEnd(headerPadding, " "),
        issues: this.issues(prefixes, "error").length
      },
      warnings: {
        tests: this.testsFailedWarnings(prefixes),
        symbol: chalk.yellow("? "),
        chalkFunction: chalk.yellow,
        heading: "Warnings:".padEnd(headerPadding, " "),
        issues: this.issues(prefixes, "warning").length
      },
      info: {
        tests: this.testsFailedInfo(prefixes),
        symbol: chalk.gray("\u2722 "),
        chalkFunction: chalk.gray,
        heading: "Info:".padEnd(headerPadding, " "),
        issues: this.issues(prefixes, "info").length
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

    let qaTestCount  = `${this.tests.length} tests`;
    let qaIssueCount = `(${this.issues().length} issues)`;

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
   * Prefixes of namespaces with one or more QA issues.
   */
  get issuePrefixes() {
    /** @type {String[]} */
    let prefixes = this.tests.reduce( (prefixes, test) => [...prefixes, ...test.prefixes], [] );
    return [...(new Set(prefixes))];
  }

  /**
   * Metadata about each test.
   * Does not include issues related to the test.
   */
  get testSuiteMetadata() {
    let copy = this.tests.map( test => Object.assign(new Test(), test));
    copy.forEach( test => delete test.issues );
    return copy;
  }

  /**
   * Total test run times in seconds.
   */
  get runTime() {
    return this.tests.reduce( (totalTime, test) => {
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
   * @param {String[]} prefixes - Filter issues by prefix
   * @param {Test.SeverityType[]} severities - Filter issues by test severity
   * @returns {Issue[]}
   */
  issues(prefixes, severities) {
    return this
    .testsFailed(prefixes, severities)
    .reduce( (results, test) => [...results, ...test.namespacesIssues(prefixes)], []);
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

