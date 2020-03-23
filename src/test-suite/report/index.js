
let { saveAs } = require("file-saver");
let xlsx = require("xlsx-populate");
let { Workbook } = xlsx;

let Test = require("../test/index");
let Issue = require("../issue/index");

let { Namespace } = require("niem-model");

class Report {

  /**
   * @param {QATestSuite} testSuite
   */
  constructor(testSuite) {
    this.testSuite = testSuite;
  }


  /**
   * Test status overview (failed, warning, and info counts) per namespace.
   *
   * @param {Namespace[]} namespaceList - List of namespaces to provide statuses for
   * @param {String[]} prefixes - Optional issue filter
   */
  report(namespaceList=[], prefixes=[]) {
    return {
      summary: this.summary(prefixes),
      namespaceStatus: this.namespaceStatus(namespaceList, prefixes),
      testStatus: this.testStatus(prefixes),
      failedTests: this.failedTests(prefixes),
      issues: this.issues(prefixes)
    }
  }

  /**
   * @param {String[]} prefixes
   */
  summary(prefixes=[]) {

    let filter = "All results returned";

    if (prefixes && prefixes.length > 0) {
      filter = "Results provided for only namespaces " + prefixes.join(", ");
    }

    return {
      timestamp: (new Date()).toLocaleString(),
      status: this.testSuite.status(prefixes),
      runTime: this.testSuite.runTime,
      issueErrorCount: this.testSuite.issues(prefixes, "error").length,
      issueWarningCount: this.testSuite.issues(prefixes, "warning").length,
      issueInfoCount: this.testSuite.issues(prefixes, "info").length,
      filter
    }
  }

  /**
   * Test status overview (failed, warning, and info counts) per namespace.
   *
   * @param {Namespace[]} namespaceList - List of namespaces to provide statuses for
   * @param {String[]} prefixes - Optional issue filter
   */
  namespaceStatus(namespaceList=[], prefixes) {

    // Copy the original array
    let namespaces = namespaceList ? namespaceList.slice() : [];

    if (namespaces.length == 0) {
      // Use namespaces with recorded issues since no list of namespaces provided
      namespaces = this.testSuite.issuePrefixes.map( prefix => new Namespace(prefix) );
    }

    if (prefixes) {
      // Filter results on provided list of prefixes
      namespaces = namespaces.filter( ns => prefixes.includes(ns.prefix) );
    }

    return namespaces.sort(Namespace.sortByStyle).map( ns => {
      return {
        prefix: ns.prefix,
        style: ns.style,
        errors: this.testSuite.issues([ns.prefix], ["error"]).length,
        warnings: this.testSuite.issues([ns.prefix], ["warning"]).length,
        info: this.testSuite.issues([ns.prefix], ["info"]).length
      }
    });

  }

  /**
   * Returns all tests, filtering issue status and issue count by prefix if given
   * @param {String[]} prefixes
   */
  testStatus(prefixes=[]) {
    return this.testSuite.tests.map( test => {
      return {
        id: test.id,
        severity: test.severity,
        description: test.description,
        status: test.namespacesStatus(prefixes),
        count: test.namespacesIssues(prefixes).length,
        category: test.category,
        specLabel: test.spec + " " + test.version,
        rule: test.rule,
        ruleURL: test.ruleURL,
        time: test.timeElapsedSeconds,
        validExample: test.exampleValid,
        invalidExample: test.exampleInvalid,
        component: test.component,
        field: test.field,
        scope: test.scope,
        source: test.source,
      };
    });
  }

  /**
   * Returns all tests, filtering issue status and issue count by prefix if given
   * @param {String[]} prefixes
   */
  failedTests(prefixes=[]) {

    // Shallow copy array to avoid overwriting an empty user array variable
    let filterPrefixes = [...prefixes];


    if (filterPrefixes.length == 0) {
      // Use all namespace prefixes with issues if no input given
      filterPrefixes = this.testSuite.issuePrefixes;
    }

    // Temporary assignment to establish Intellisense
    let initial = this.failedTestReportPerNamespace("bogus");
    initial = [];

    // Return the set of failed test reports for each namespace
    return filterPrefixes.reduce( (results, prefix) => {
      return [...results, ...this.failedTestReportPerNamespace(prefix)];
    }, initial);

  }

  /**
   * Returns all tests, filtering issue status and issue count by prefix if given
   * @private
   * @param {String} prefix
   */
  failedTestReportPerNamespace(prefix) {

    return this.testSuite.testsFailed([prefix]).map( test => {
      return {
        id: test.id,
        severity: test.severity,
        description: test.description,
        prefix,
        count: test.namespacesIssues([prefix]).length,
        category: test.category,
        specLabel: test.spec + " " + test.version,
        rule: test.rule,
        ruleURL: test.ruleURL,
        validExample: test.exampleValid,
        invalidExample: test.exampleInvalid,
        component: test.component,
        field: test.field,
        scope: test.scope,
        source: test.source,
      };
    });

  }

  /**
   * Array of test issues, with test info embedded directly into each issue object.
   *
   * @param {String[]} prefixes - Prefix for issue filtering
   */
  issues(prefixes) {

    // Temporary assignment to establish return type for Intellisense
    let results = this.testSuite.tests[0] ? this.testSuite.tests[0].issueReport() : undefined;

    results = [];

    // Return flattened array of issue reports for each test
    return this.testSuite.testsFailed(prefixes).reduce( (results, test) => {
      return [...results, ...test.issueReport(prefixes)];
    }, results);

  }


  /**
   * @param {String} fileName
   * @param {Namespace[]} testedNamespaces
   * @param {String[]} prefixes - Prefixes for issue filtering
   * @param {ResultsOptionsType} options
   */
  async saveAsDownload(fileName, testedNamespaces, prefixes, options) {

    // Make sure the file has a single ".xlsx" extension
    fileName = fileName.replace(/.xlsx$/, "") + ".xlsx";

    let blob = await this.reportBinary(testedNamespaces, prefixes, "blob", options);
    saveAs(blob, fileName);
  }

  /**
   * @param {String} filePath
   * @param {Namespace[]} testedNamespaces
   * @param {String[]} prefixes - Prefix for issue filtering
   * @param {ResultsOptionsType} options
   */
  async saveAsFile(filePath, testedNamespaces, prefixes, options) {

    let fs = require("fs").promises;
    let buffer = await this.reportBinary(testedNamespaces, prefixes, "buffer", options);

    // Make sure the file path has a single ".xlsx" extension
    filePath = filePath.replace(/.xlsx$/, "") + ".xlsx";
    return fs.writeFile(filePath, buffer);
  }

  /**
   * @private
   * @param {Namespace[]} testedNamespaces
   * @param {String[]} prefixes - Prefixes to filter the results on
   * @param {"buffer"|"blob"} format
   * @param {ResultsOptionsType} options
   */
  async reportBinary(testedNamespaces=[], prefixes, format="Buffer", options) {

    let path = require("path");
    let filePath = path.resolve(__dirname, "../../../templates/test-results-template.xlsx");
    let workbook = await xlsx.fromFileAsync(filePath);

    this.writeSummaryTab(workbook, prefixes);
    writeTab(workbook, "Status", this.namespaceStatus(testedNamespaces, prefixes));
    writeTab(workbook, "All Tests", this.testStatus(prefixes));
    writeTab(workbook, "Failed Tests", this.failedTests(prefixes));
    writeTab(workbook, "Issues", this.issues(prefixes));

    // Add rule hyperlinks to the Test tab
    setRuleHyperlinks(workbook);

    // Handle options
    setWorkbookOptions(workbook, options);

    // Hide issue source columns if empty
    hideSourceColumns(workbook, this.testSuite.issues(prefixes));

    // Save workbook to buffer
    return workbook.outputAsync(format);
  }

  /**
   * @private
   * @param {Workbook} workbook
   * @param {String[]} prefixes
   */
  writeSummaryTab(workbook, prefixes=[]) {

    let sheet = workbook.sheet("Info");
    let info = this.summary(prefixes);

    sheet.cell("B2").value(info.status);
    sheet.cell("B3").value(info.timestamp);
    sheet.cell("B4").value(info.filter);
    sheet.cell("B5").value(info.runTime + " seconds");
    sheet.cell("B6").value(info.issueErrorCount);
    sheet.cell("B7").value(info.issueWarningCount);
    sheet.cell("B8").value(info.issueInfoCount);

  }


}


/**
 * Loads the given data into the worksheet tab with the given name.
 *
 * @private
 * @param {Workbook} workbook
 * @param {String} tabName
 * @param {Object[]} data
 */
function writeTab(workbook, tabName, data=[]) {
  if (data.length == 0) return;
  let sheet = workbook.sheet(tabName);
  let rows = objectsToRows(data);
  sheet.cell("A2").value(rows);
}

/**
 * Converts an array of objects with simple properties to an array of arrays.
 * @private
 * @param {Object[]} objects
 */
function objectsToRows(objects) {
  if (!objects) return [];

  return objects.map( object => {
    return Object.keys(object).map( key => object[key] );
  });
}

/**
 * @param {Workbook} workbook
 * @param {Issue[]} issues
 */
function hideSourceColumns(workbook, issues) {
  let sheet = workbook.sheet("Issues");
  if (! fieldHasValues(issues, "location")) sheet.column("G").hidden(true);
  if (! fieldHasValues(issues, "line")) sheet.column("H").hidden(true);
  if (! fieldHasValues(issues, "position")) sheet.column("I").hidden(true);
}

/**
 * @param {Issue[]} issues
 * @param {string} field
 */
function fieldHasValues(issues, field) {
  let values = issues.reduce( (values, issue) => [...values, issue[field]], []);
  let set = new Set(values);
  set.delete("");
  set.delete(null);
  set.delete(undefined);
  return set.size > 0;
}

/**
 * Takes the values from the Rule and RuleURL columns, replaces the Rule value
 * with a hyperlink, and hides the RuleURL column.
 *
 * Runs on the 'Tests' and 'Failed tests by namespace' tabs.
 *
 * @private
 * @param {Workbook} workbook
 */
function setRuleHyperlinks(workbook) {
  setRuleHyperlinks_Tab(workbook, "All Tests", "H", "I");
  setRuleHyperlinks_Tab(workbook, "Failed Tests", "H", "I");
}

/**
 * Takes the values from the Rule and RuleURL columns in the Tests tab,
 * replaces the Rule value with a hyperlink, and hides the RuleURL column.
 *
 * @private
 * @param {Workbook} workbook
 * @param {String} tabName
 * @param {String} ruleColNum
 * @param {String} urlColNum
 */
function setRuleHyperlinks_Tab(workbook, tabName, ruleColNum, urlColNum) {

  let sheet = workbook.sheet(tabName);
  let lastRowNumber = sheet.usedRange().endCell().rowNumber();

  for (let rowNum=2; rowNum<lastRowNumber; rowNum++) {

    // Get rule cell, label, and URL
    let cell = sheet.cell(rowNum, ruleColNum);
    let label = cell.value();
    let url = sheet.cell(rowNum, urlColNum).value();

    // Skip hyperlink if no valid rule number
    if (! label || ! label.includes("-")) continue;

    // Update rule cell with Excel hyperlink
    cell
    .value("Rule " + label)
    .style({ fontColor: "0563c1", underline: true })
    .hyperlink(url);
  }

  sheet.column(urlColNum).hidden(true);

}

/**
 * @param {Workbook} workbook
 * @param {ResultsOptionsType} options
 */
function setWorkbookOptions(workbook, options={}) {

  if (options.sourceFormat == "spreadsheet" ) {
    // Customize Location / Line / Position column headers
    let sheet = workbook.sheet("Issues");
    sheet.cell("G1").value("Tab");
    sheet.cell("H1").value("Row");
    sheet.cell("I1").value("Col");
  }

}


/**
 * @typedef {Object} ResultsOptionsType
 * @property {"spreadsheet"|"file"} sourceFormat
 */
let resultsOptions;


module.exports = Report;

let QATestSuite = require("../index");
