
let xlsx = require("xlsx-populate");
let { saveAs } = require("file-saver");

/**
 * @private
 * @type {import("xlsx-populate").Workbook}
 */
 let WorkbookDef;

let Issue = require("./issue");

let { Namespace, TypeDefs } = require("niem-model");
let { NamespaceDef } = TypeDefs;

class Report {

  /**
   * @param {NIEMModelQA} qa
   */
  constructor(qa) {
    this.qa = qa;
  }


  /**
   * Test status overview (failed, warning, and info counts) per namespace.
   *
   * @param {NamespaceDef[]} namespaceList - List of namespaces to provide statuses for
   * @param {string[]} prefixes - Optional issue filter
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
   * @param {string[]} prefixes
   */
  summary(prefixes=[]) {

    let filter = "All results returned";

    if (prefixes && prefixes.length > 0) {
      filter = "Results provided for only namespaces " + prefixes.join(", ");
    }

    return {
      timestamp: (new Date()).toLocaleString(),
      status: this.qa.results.status(prefixes),
      runTime: this.qa.results.runTime,
      issueErrorCount: this.qa.results.issues(prefixes, ["error"]).length,
      issueWarningCount: this.qa.results.issues(prefixes, ["warning"]).length,
      issueInfoCount: this.qa.results.issues(prefixes, ["info"]).length,
      filter
    }
  }

  /**
   * Test status overview (failed, warning, and info counts) per namespace.
   *
   * @param {NamespaceDef[]} namespaceList - List of namespaces to provide statuses for
   * @param {string[]} prefixes - Optional issue filter
   */
  namespaceStatus(namespaceList=[], prefixes) {

    // Copy the original array
    let namespaces = namespaceList ? namespaceList.slice() : [];

    if (namespaces.length == 0) {
      // Use namespaces with recorded issues since no list of namespaces provided
      namespaces = this.qa.results.issuePrefixes.map( prefix => new Namespace(prefix) );
    }

    if (prefixes) {
      // Filter results on provided list of prefixes
      namespaces = namespaces.filter( ns => prefixes.includes(ns.prefix) );
    }

    return namespaces.sort(Namespace.sortByStyle).map( ns => {
      return {
        prefix: ns.prefix,
        style: ns.style,
        errors: this.qa.results.issues([ns.prefix], ["error"]).length,
        warnings: this.qa.results.issues([ns.prefix], ["warning"]).length,
        info: this.qa.results.issues([ns.prefix], ["info"]).length
      }
    });

  }

  /**
   * Returns all tests, filtering issue status and issue count by prefix if given
   * @param {string[]} prefixes
   */
  testStatus(prefixes=[]) {
    return this.qa._tests.map( test => {
      return {
        id: test.id,
        severity: test.severity,
        description: test.description,
        status: test.namespaces.status(prefixes),
        count: test.namespaces.issues(prefixes).length,
        category: test.category,
        specLabel: test.specID,
        rule: test.ruleNumber,
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
   * @param {string[]} prefixes
   */
  failedTests(prefixes=[]) {

    // Shallow copy array to avoid overwriting an empty user array variable
    let filterPrefixes = [...prefixes];


    if (filterPrefixes.length == 0) {
      // Use all namespace prefixes with issues if no input given
      filterPrefixes = this.qa.results.issuePrefixes;
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
   * @param {string} prefix
   */
  failedTestReportPerNamespace(prefix) {

    return this.qa.results.tests.failed([prefix]).map( test => {
      return {
        id: test.id,
        severity: test.severity,
        description: test.description,
        prefix,
        count: test.namespaces.issues([prefix]).length,
        category: test.category,
        specLabel: test.specID,
        rule: test.ruleNumber,
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
   * @param {string[]} prefixes - Prefix for issue filtering
   */
  issues(prefixes) {

    let issues = this.qa.results.issues(prefixes);

    return issues.map( issue => {
      return {
        id: issue.test.id,
        severity: issue.test.severity,
        description: issue.test.description,
        prefix: issue.prefix,
        label: issue.label,
        problemValue: issue.problemValue,
        location: issue.location,
        line: issue.line,
        comments: issue.comments
      }
    });

  }


  /**
   * @param {string} fileName
   * @param {NamespaceDef[]} testedNamespaces
   * @param {string[]} prefixes - Prefixes for issue filtering
   * @param {ResultsOptionsType} options
   */
  async saveAsDownload(fileName, testedNamespaces, prefixes, options) {

    // Make sure the file has a single ".xlsx" extension
    fileName = fileName.replace(/.xlsx$/, "") + ".xlsx";

    let blob = await this.reportBinary(testedNamespaces, prefixes, "blob", options);
    saveAs( /** @type {Blob} */ (blob), fileName);
  }

  /**
   * @param {string} filePath
   * @param {NamespaceDef[]} [testedNamespaces]
   * @param {string[]} [prefixes] - Prefix for issue filtering
   * @param {ResultsOptionsType} [options]
   */
  async saveAsFile(filePath, testedNamespaces, prefixes, options) {

    let fs = require("fs-extra");
    let buffer = await this.reportBinary(testedNamespaces, prefixes, "buffer", options);

    // Make sure the file path has a single ".xlsx" extension
    filePath = filePath.replace(/.xlsx$/, "") + ".xlsx";
    return fs.outputFile(filePath, buffer);
  }

  /**
   * @private
   * @param {NamespaceDef[]} [testedNamespaces]
   * @param {string[]} [prefixes] - Prefixes to filter the results on
   * @param {"buffer"|"blob"} [format]
   * @param {ResultsOptionsType} [options]
   */
  async reportBinary(testedNamespaces=[], prefixes, format="buffer", options) {

    let path = require("path");
    let filePath = path.resolve(__dirname, "../templates/test-results-template.xlsx");
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
    hideSourceColumns(workbook, this.qa.results.issues(prefixes));

    // Save workbook to buffer
    return workbook.outputAsync(format);
  }

  /**
   * @private
   * @param {WorkbookDef} workbook
   * @param {string[]} prefixes
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
 * @param {WorkbookDef} workbook
 * @param {string} tabName
 * @param {Object[]} data
 */
function writeTab(workbook, tabName, data=[]) {
  if (data.length == 0) return;
  let sheet = workbook.sheet(tabName);
  let rows = objectsToRows(data);
  // @ts-ignore
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
 * @private
 * @param {WorkbookDef} workbook
 * @param {Issue[]} issues
 */
function hideSourceColumns(workbook, issues) {
  let sheet = workbook.sheet("Issues");
  if (! fieldHasValues(issues, "location")) sheet.column("G").hidden(true);
  if (! fieldHasValues(issues, "line")) sheet.column("H").hidden(true);
}

/**
 * @private
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
 * @param {WorkbookDef} workbook
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
 * @param {WorkbookDef} workbook
 * @param {string} tabName
 * @param {string} ruleColNum
 * @param {string} urlColNum
 */
function setRuleHyperlinks_Tab(workbook, tabName, ruleColNum, urlColNum) {

  let sheet = workbook.sheet(tabName);
  let lastRowNumber = sheet.usedRange().endCell().rowNumber();

  for (let rowNum=2; rowNum<lastRowNumber; rowNum++) {

    // Get rule cell, label, and URL
    let cell = sheet.cell(rowNum, ruleColNum);
    let label = /** @type {string} */ (cell.value());
    let url = sheet.cell(rowNum, urlColNum).value();

    // Skip hyperlink if no valid rule number
    if (! label || ! label.includes("-")) continue;

    // Update rule cell with Excel hyperlink
    if (url) {
      cell
      .value("Rule " + label)
      .style({ fontColor: "0563c1", underline: true })
      .hyperlink(url);
    }
  }

  sheet.column(urlColNum).hidden(true);

}

/**
 * @private
 * @param {WorkbookDef} workbook
 * @param {ResultsOptionsType} [options]
 */
function setWorkbookOptions(workbook, options={sourceFormat: "spreadsheet"}) {

  if (options.sourceFormat == "spreadsheet" ) {
    // Customize location and line column headers
    let sheet = workbook.sheet("Issues");
    sheet.cell("G1").value("Tab");
    sheet.cell("H1").value("Row");
  }

}


/**
 * @private
 * @typedef {Object} ResultsOptionsType
 * @property {"spreadsheet"|"file"} sourceFormat
 */
let resultsOptions;

let NIEMModelQA = require("./index");

module.exports = Report;
