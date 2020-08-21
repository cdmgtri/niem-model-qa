
let Test = require("./test");
let Issue = require("./issue");
let SpreadsheetUtils = require("./utils/xlsx");

class Tests {

  /**
   * @param {NIEMModelQA} qa
   */
  constructor(qa) {
    this.qa = qa;
  }

  /**
   * Adds test objects into the test suite.
   * @param {Test[]} tests
   * @param {boolean} reset True to remove existing tests; false to append new tests onto existing tests
   */
  add(tests, reset=false) {

    if (reset) this.qa._tests = [];

    for (let newTest of tests) {
      let existingTest = this.find(newTest.id);
      if (existingTest) {
        existingTest.append(newTest);
      }
      else {
        this.qa._tests.push(newTest);
      }
    }

    return tests;

  }

  /**
   * Returns a test from the test suite with the given ID.

   * @param {String} testID
   */
  find(testID) {
    return this.qa._tests.find(test => test.id == testID);
  }

  get length() {
    return this.qa._tests.length;
  }

  /**
   * @param {String} filePath
   * @param {boolean} reset Overwrite existing tests if true
   */
  async loadSpreadsheet(filePath, reset=true) {

    /** @type {Test[]} */
    let tests = [];

    let workbook = await SpreadsheetUtils.getWorkbook(filePath);
    let rows = await SpreadsheetUtils.getRows(workbook, 0, true);

    // Convert spreadsheet rows to test objects
    rows.forEach( row => tests.push(new Test(...row) ) );

    return this.qa.tests.add(tests, reset);

  }

  /**
   * Metadata about each test.
   * Does not include issues related to the test.
   * @returns {Test[]}
   */
  get metadata() {
    let copy = this.qa._tests.map( test => Object.assign(new Test(), test));
    copy.forEach( test => delete test.issues );
    return copy;
  }

  /**
   * Logs issues for the test.
   *
   * @param {Test} test
   * @param {NIEMObject[]} problemObjects
   * @param {String} problemField
   * @param {Function} commentFunction - For each problem object, returns the corresponding comment string
   * @param {Boolean} [reset=false] True to replace current results; false (default) to append
   */
  post(test, problemObjects, problemField, commentFunction = () => "", reset=false) {

    /** @type {Issue[]} */
    let issues = [];

    // Process inputs into an array of issues
    for (let object of problemObjects) {

      let label = object.label;
      let problemValue = object[problemField];
      let comment = commentFunction(object);

      let isException = test.exceptionLabels.includes(object.label);

      if (isException == false || (isException == true && this.qa.ignoreExceptions == false)) {
        let issue = new Issue(object.authoritativePrefix, label, object.input_location, object.input_line, object.input_position, problemValue, comment, test);
        issues.push(issue);
      }

    }

    // Mark test as ran and load any issues
    test.log(issues, reset);

    return test;

  }

  /**
   * Resets each test status back to its initial state and removes all issues.
   */
  reset() {
    this.qa._tests.forEach( test => test.reset() );
  }

  /**
   * Saves test metadata to a JSON file
   */
  async save(filePath) {
    let fs = require("fs-extra");
    await fs.outputJSON(filePath, this.metadata, {spaces: 2});
  }

  /**
   * Starts the clock on a test or throws error if not found.
   * @param {string} testID
   */
  start(testID) {
    let test = this.find(testID);
    if (! test) throw new Error(`Test ${testID} not found`);
    test.timeStart = Date.now();
    return test;
  }


}

const NIEMModelQA = require("./index");

module.exports = Tests;
