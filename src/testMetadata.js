
let Test = require("./test-suite/test/index");
let SpreadsheetUtils = require("./utils/xlsx");

class TestMetadata {

  /**
   * @param {NIEMModelQA} qa
   */
  constructor(qa) {
    this.qa = qa;
  }


  /**
   * Metadata about each test.
   * Does not include issues related to the test.
   * @returns {Test[]}
   */
  get tests() {
    let copy = this.qa.tests.map( test => Object.assign(new Test(), test));
    copy.forEach( test => delete test.issues );
    return copy;
  }

  /**
   * Adds test objects into the test suite.
   * @param {Test[]} tests
   * @param {boolean} reset True to remove existing tests; false to append new tests onto existing tests
   */
  add(tests, reset=false) {
    if (reset) this.qa.tests = [];
    this.qa.tests.push(...tests);
    return tests;
  }

  /**
   * @param {String} filePath
   * @param {boolean} reset Overwrite existing tests if true
   */
  async loadSpreadsheet(filePath, reset=true) {

    if (reset) this.qa.tests = [];

    /** @type {Test[]} */
    let tests = [];

    let workbook = await SpreadsheetUtils.getWorkbook(filePath);
    let rows = await SpreadsheetUtils.getRows(workbook, 0, true);

    // Convert spreadsheet rows to test objects
    rows.forEach( row => tests.push(new Test(...row) ) );

    // return tests;
    return this.qa.testMetadata.add(tests);

  }

  /**
   * Resets each test status back to its initial state and removes all issues.
   */
  reset() {
    this.qa.tests.forEach( test => test.reset() );
  }

  /**
   * Saves test metadata to a JSON file
   */
  async save(filePath) {
    let fs = require("fs-extra");
    await fs.outputJSON(filePath, this.tests, {spaces: 2});
  }

}

const NIEMModelQA = require("./index");

module.exports = TestMetadata;
