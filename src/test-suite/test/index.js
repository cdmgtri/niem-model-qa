
let Issue = require("../issue/index");
let NIEMSpecs = require("niem-specification-utils-js");

class Test {

  /**
   * @param {String} id - Test ID
   * @param {String} description - Test description
   * @param {String} category - Test category
   * @param {String} component - Object of the test (e.g., Property, Type)
   * @param {String} field - Object property being tested (e.g., name, definition)
   * @param {String} scope - Subset of objects being tested (e.g., attributes)
   * @param {String} source - Source or format being tested (e.g., model, IEPD, XSD)
   * @param {Test.SeverityType} severity - Severity level of a failed test
   * @param {"NDR"|"MPD"|"CL"} specLabel - NIEM specification ID
   * @param {String} rule - NIEM specification rule number
   * @param {String} validExample - An example that would pass the test
   * @param {String} invalidExample - An example that would fail the test
   * @param {String} exceptions - Free-text description of allowed exceptions
   * @param {String} exceptionIDs - Comma-delimited list of ids for allowed exceptions
   * @param {String} notes - Other details or comments about the test
   * @param {Boolean} [ran=false] - True if a test ran; false otherwise
   */
  constructor(id, description, category, component, field, scope, source, severity, specLabel="", rule="", validExample, invalidExample, exceptions, exceptionIDs="", notes, ran=false) {

    let [spec, version] = specLabel.trim().split(" ");

    this.id = id;
    this.description = description;
    this.category = category;
    this.component = component;
    this.field = field;
    this.scope = scope;
    this.source = source;
    this.severity = severity;
    this.spec = spec;
    this.version = version || "";
    this.rule = rule;
    this.exampleValid = validExample;
    this.exampleInvalid = invalidExample;
    this.exceptions = exceptions;
    this.exceptionLabels = [];
    this.notes = notes;
    this.ran = ran;

    if (exceptionIDs) {
      // Clean up and split comma-separated values
      this.exceptionLabels = exceptionIDs.trim().replace(/,$/, "").replace(/\s/g, "").split(",");
    }

    /** @type {number} */
    this.timeStart;

    /** @type {number} */
    this.timeEnd;

    /** @type {Issue[]} */
    this.issues = [];

  }

  /**
   * Starts the timer for the test run time.
   */
  start() {
    this.timeStart = Date.now();
  }

  /**
   * Logs this test as having ran, ends the test run timer, and pushes any given issues.
   *
   * @param {Issue[]} issues
   * @param {Boolean} [append=false] Append rather than replace current test issues.
   */
  log(issues=[], append=false) {
    this.ran = true;
    this.timeEnd = Date.now();
    if (append) this.issues = [];
    this.issues.push(...issues);
  }

  /**
   * Resets test execution information - run status and timer, and test issues.
   */
  reset() {
    this.ran = false;
    this.timeStart = undefined;
    this.timeEnd = undefined;
    this.issues = [];
  }

  /**
   * URL for the specific specification rule.
   * @type {String}
   */
  get ruleURL() {
    return NIEMSpecs.ruleURL(this.spec, this.version, this.rule);
  }

  /**
   * Unique array of namespace prefixes with issues.
   * @type {String[]}
   */
  get prefixes() {
    let prefixes = this.issues.map( issue => issue.prefix );
    return [ ...(new Set(prefixes)) ];
  }

  /**
   * Test run time, in milliseconds
   */
  get timeElapsedMilliseconds() {
    if (this.timeStart && this.timeEnd) {
      return this.timeEnd - this.timeStart;
    }
  }

  /**
   * Test run time, in seconds
   */
  get timeElapsedSeconds() {
    if (this.timeStart && this.timeEnd) {
      // Round to 1 decimal
      return +(this.timeElapsedMilliseconds / 1000).toFixed(1);
    }
  }

  /**
   * True if a test has run and had no issues.
   */
  get passed() {
    return this.ran && this.issues.length == 0;
  }

  /**
   * True if a test has run and had one or more issues.
   */
  get failed() {
    return this.ran && this.issues.length > 0;
  }

  /**
   * Test status based on if the test ran and has issues.
   * @returns {"pass"|"fail"|"not ran"}
   */
  get status() {
    if (this.passed) return "pass";
    if (this.failed) return "fail";
    return "not ran";
  }

  /**
   * Test issues, optionally filtered by the given prefixes.
   * @param {String[]} prefixes - Filters test issues on the given namespace prefix.
   * @return {Issue[]}
   */
  namespacesIssues(prefixes=[]) {
    if (prefixes.length == 0) return this.issues;
    return this.issues.filter( issue => prefixes.includes(issue.prefix) );
  }

  /**
   * True if the test ran and has no issues, optionally filtered by the given prefixes.
   * @param {String[]} prefixes - Filters results for the given prefix.
   * @returns {Boolean}
   */
  namespacesPassed(prefixes) {
    return this.ran && this.namespacesIssues(prefixes).length == 0;
  }

  /**
   * True if the test ran and has issues, optionally filtered by the given prefixes.
   * @param {String[]} prefixes - Filters results for the given prefix.
   * @returns {Boolean}
   */
  namespacesFailed(prefixes) {
    return this.ran && this.namespacesIssues(prefixes).length > 0;
  }

  /**
   * Test status based on if the test ran and has issues.
   * @param {String[]} prefixes - Filters results for the given prefix.
   * @returns {"pass"|"fail"|"not ran"}
   */
  namespacesStatus(prefixes) {
    if (this.namespacesPassed(prefixes)) return "pass";
    if (this.namespacesFailed(prefixes)) return "fail";
    return "not ran";
  }


  /**
   * Array of test issues, with test info embedded directly into each issue object.
   *
   * @param {String[]} prefixes - Prefix for issue filtering
   */
  issueReport(prefixes) {
    return this.namespacesIssues(prefixes).map( issue => {
      return {
        id: this.id,
        severity: this.severity,
        description: this.description,
        prefix: issue.prefix,
        label: issue.label,
        problemValue: issue.problemValue,
        location: issue.location,
        line: issue.line,
        position: issue.position,
        comments: issue.comments
      }
    });
  }

}

Test.Issue = Issue;

/** @type {"error"|"warning"|"info"} */
Test.SeverityType;

module.exports = Test;
