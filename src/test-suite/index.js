
let xlsx = require("xlsx-populate");
let { NIEMObject } = require("niem-model");

let Test = require("./test/index");
let Issue = require("./issue/index");
let Report = require("./report/index");

/**
 * NIEM Test Suite
 */
class QATestSuite {

  constructor() {

    /** @type {Test[]} */
    this.tests = [];

    this.report = new Report(this);

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
      test.issues = [];
    }

    // Process inputs into an array of issues
    let issues = problemObjects.map( object => {

      let problemValue = object[problemField];
      let comment = commentFunction ? commentFunction(problemValue) : "";

      return new Issue(object.authoritativePrefix, object.label, object.input_location, object.input_line, object.input_position, problemValue, comment);

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

