
let Issue = require("./issue");
let { NIEMSpecifications } = require("niem-specification-utils");

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
    this.timeElapsedMs = 0;

    if (exceptionIDs) {
      // Split comma-separated values
      this.exceptionLabels = exceptionIDs.trim().replace(/,$/, "").split(", ");
    }

    /** @type {number} */
    this.timeStart;

    /** @type {Issue[]} */
    this.issues = [];

  }

  /**
   * Appends the given test issues and run time onto this test.
   *
   * @param {Test} test
   */
  append(test) {
    this.timeElapsedMs += test.timeElapsedMs;
    this.issues.push(...test.issues);
  }

  /**
   * Logs this test as having ran, ends the test run timer, and pushes any given issues.
   *
   * @param {Issue[]} issues
   * @param {Boolean} [reset=false] True to replace current results; false (default) to append
   */
  log(issues=[], reset=false) {

    if (reset == true) this.reset();

    // Close out test
    this.ran = true;
    this.timeElapsedMs = this.timeElapsedMs + (Date.now() - this.timeStart);
    issues.forEach( issue => issue.test = this );

    this.issues.push(...issues);
    return this;
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

  get namespaces() {

    let self = this;

    return {

      /**
       * Test issues, optionally filtered by the given prefixes.
       * @param {String[]} prefixes - Filters test issues on the given namespace prefix.
       * @return {Issue[]}
       */
      issues(prefixes=[]) {
        if (prefixes.length == 0) return self.issues;
        if (!self.issues || self.issues.length == 0) return [];
        return self.issues.filter( issue => prefixes.includes(issue.prefix) );
      },

      /**
       * Unique array of namespace prefixes with issues.
       * @type {String[]}
       */
      prefixes() {
        if (self.issues.length == 0) return [];
        let prefixes = self.issues.map( issue => issue.prefix );
        return [ ...(new Set(prefixes)) ];
      },

      /**
       * True if the test ran and has no issues, optionally filtered by the given prefixes.
       * @param {String[]} prefixes - Filters results for the given prefix.
       * @returns {Boolean}
       */
      passed(prefixes) {
        return self.ran && self.namespaces.issues(prefixes).length == 0;
      },

      /**
       * True if the test ran and has issues, optionally filtered by the given prefixes.
       * @param {String[]} prefixes - Filters results for the given prefix.
       * @returns {Boolean}
       */
      failed(prefixes) {
        return self.ran && self.namespaces.issues(prefixes).length > 0;
      },

      /**
       * Test status based on if the test ran and has issues.
       * @param {String[]} prefixes - Filters results for the given prefix.
       * @returns {"pass"|"fail"|"not ran"}
       */
      status(prefixes) {
        if (self.namespaces.passed(prefixes)) return "pass";
        if (self.namespaces.failed(prefixes)) return "fail";
        return "not ran";
      }

    }
  }

  /**
   * Resets test execution information - run status and timer, and test issues.
   */
  reset() {
    this.ran = false;
    this.timeStart = undefined;
    this.timeElapsedMs = 0;
    this.issues = [];
  }

  /**
   * URL for the specific specification rule.
   * @type {String}
   */
  get ruleURL() {
    let specs = new NIEMSpecifications();
    let spec = specs.specification(this.spec + "-" + this.version);
    return `${spec.url}#rule_${this.rule}`;
  }

  /**
   * Starts the timer for the test run time.
   */
  start() {
    this.timeStart = Date.now();
  }

  /**
   * Test run time, in seconds
   */
  get timeElapsedSeconds() {
    return +(this.timeElapsedMs / 1000).toFixed(1);
  }

}

Test.Issue = Issue;

/** @type {"error"|"warning"|"info"} */
Test.SeverityType;

module.exports = Test;
