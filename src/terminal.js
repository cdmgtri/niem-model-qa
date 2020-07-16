
const chalk = require("chalk");
const NIEMModelQA = require("./index");
const Test = require("./test");

class Terminal {

  /**
   * @param {NIEMModelQA} qa
   */
  constructor(qa) {
    this.qa = qa;
  }
  /**
   * Print QA status to the console.
   * @param {String[]} prefixes
   */
  printStatus(prefixes) {

    // A summary line for each test, showing if the test passed or failed.  Includes issue counts.
    let testSummaryLines = []
    .concat( testStatusLines( summary(this.qa, prefixes).passed ) )
    .concat( testStatusLines( summary(this.qa, prefixes).info ) )
    .concat( testStatusLines( summary(this.qa, prefixes).warnings ) )
    .concat( testStatusLines( summary(this.qa, prefixes).errors ) );

    // A summary line for each kind of test status (passed, errors, warnings, info).  Includes issue counts.
    let severitySummaryLines = [];
    severitySummaryLines.push(severityStatusLine( summary(this.qa, prefixes).passed ))
    severitySummaryLines.push(severityStatusLine( summary(this.qa, prefixes).info ))
    severitySummaryLines.push(severityStatusLine( summary(this.qa, prefixes).warnings ))
    severitySummaryLines.push(severityStatusLine( summary(this.qa, prefixes).errors ));

    // Total counts
    let qaTestCount  = `${this.qa.tests.length} tests`;
    let qaIssueCount = `(${this.qa.results.issues().length} issues)`;

    // Print to console
    console.log(`
    ---------------------------------------------------------------
      NIEM QA Results:
    ---------------------------------------------------------------
      ${testSummaryLines.join("\n      ")}
    ---------------------------------------------------------------
      ${severitySummaryLines.filter( str => str ).join("\n      ")}
    ---------------------------------------------------------------
      QA Summary:    ${qaTestCount} ${qaIssueCount.padStart(15, " ")}
    `);

  }

}


/**
 * Summary of QA results and formatting info for the terminal display
 *
 * @param {NIEMModelQA} qa
 * @param {String[]} prefixes
 */
function summary(qa, prefixes) {

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
      tests: qa.results.tests.passed(prefixes),
      symbol: chalk.green("\u2714 "),
      chalkFunction: chalk.green,
      heading: "Passed:".padEnd(headerPadding, " "),
    },
    errors: {
      tests: qa.results.tests.failedErrors(prefixes),
      symbol: chalk.red("\u2716 "),
      chalkFunction: chalk.red,
      heading: "Errors:".padEnd(headerPadding, " "),
      issues: qa.results.issues(prefixes, "error").length
    },
    warnings: {
      tests: qa.results.tests.failedWarnings(prefixes),
      symbol: chalk.yellow("? "),
      chalkFunction: chalk.yellow,
      heading: "Warnings:".padEnd(headerPadding, " "),
      issues: qa.results.issues(prefixes, "warning").length
    },
    info: {
      tests: qa.results.tests.failedInfo(prefixes),
      symbol: chalk.gray("\u2722 "),
      chalkFunction: chalk.gray,
      heading: "Info:".padEnd(headerPadding, " "),
      issues: qa.results.issues(prefixes, "info").length
    }
  }

  return summary;

}


/**
 * @param {Test} test
 * @param {Details} details
 */
function testStatusLine(test, details) {
  let issueCount = "";
  if (test.issues.length > 0) {
    issueCount = `(${test.issues.length} issue${test.issues.length > 1 ? "s" : ""})`;
  }
  return `${details.symbol} ${test.id}  ${details.chalkFunction(issueCount)}`;
}

/**
 * @param {Details} details
 */
function testStatusLines(details) {
  if (details.tests.length == 0) return [];
  return details.tests
  .sort( (test1, test2) => test1.id.localeCompare(test2.id) )
  .map( test => testStatusLine(test, details));
}

/**
 * @param {Details} details
 */
function severityStatusLine(details) {
  if (details.tests.length == 0) return;
  let severitySummary = `${details.tests.length} tests`.padStart(9, " ");
  let issueCount = details.issues ? `(${details.issues} issues)`.padStart(15, " ") : "";
  return `${details.symbol} ${details.heading} ${details.chalkFunction(severitySummary, issueCount)}`;
}


module.exports = Terminal;
