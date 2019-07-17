
let XLSX = require("xlsx");
let Issue = require("../issue/index");

class Test {

  /**
   * @param {String} id
   * @param {String} description
   * @param {String} category
   * @param {String} ndr
   * @param {String} component
   * @param {String} field
   * @param {String} applicability
   * @param {"error"|"warning"|"info"} severity
   * @param {String} exceptions
   * @param {Boolean} [ran=false]
   */
  constructor(id, description, category, ndr, component, field, applicability, severity, exceptions, ran=false) {

    this.id = id;
    this.description = description;
    this.category = category;
    this.ndr = ndr;
    this.component = component;
    this.field = field;
    this.applicability = applicability;
    this.severity = severity;
    this.exceptions = exceptions;
    this.ran = ran;

    /** @type {Issue[]} */
    this.issues = [];
  }

  get passed() {
    return this.ran && this.issues.length == 0;
  }

  get problems() {
    return this.ran && this.issues.length > 0;
  }

  /**
   * Loads a test suite spreadsheet and returns an array of tests.
   * Works in Node only - XLSX.readFile().
   *
   * @param {String} filePath
   * @returns {Test[]}
   */
  static loadTestSuite(filePath) {

    let workbook = XLSX.readFile(filePath, {type: "array"});
    let sheet = workbook.Sheets["Sheet1"];
    let rows = XLSX.utils.sheet_to_json(sheet, {defval: ""});

    return rows.map( row => {
      return new Test(row.ID, row.Description, row.Category, row.NDR, row.Component, row.Field, row.Applicability, row.Severity, row.Exceptions);
    });

  }

  /**
   * @param {Test[]} tests
   * @param {NIEMObject[]} problemComponents
   * @param {String} testID
   * @param {String} problemField
   * @param {String} expectedValue
   */
  static logResults(tests, problemComponents, testID, problemField, expectedValue="") {

    let test = tests.find( test => test.id == testID );

    test.ran = true;

    let issues = Issue.getIssues(problemComponents, problemField, expectedValue);
    test.issues.push(...issues);

    return test.issues;

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
   * Returns a test from the given set of tests with the given ID, and marks it as ran.
   *
   * @param {Test[]} tests
   * @param {String} testID
   */
  static run(tests, testID) {
    let test = Test.find(tests, testID);
    test.ran = true;
    return test;
  }

}

Test.Issue = Issue;

module.exports = Test;
