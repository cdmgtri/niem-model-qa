
let Issue = require("./issue");

let { NIEMSpecificationLibrary } = require("niem-specification-utils");

let specLib = new NIEMSpecificationLibrary();

specLib.load();

class Test {

  /**
   * @param {string} [id] - Test ID
   * @param {string} [description] - Test description
   * @param {string} [category] - Test category
   * @param {string} [component] - Object of the test (e.g., Property, Type)
   * @param {string} [field] - Object property being tested (e.g., name, definition)
   * @param {string} [scope] - Subset of objects being tested (e.g., attributes)
   * @param {string} [source] - Source or format being tested (e.g., model, IEPD, XSD)
   * @param {Test.SeverityType} [severity] - Severity level of a failed test
   * @param {string} [specID] - NIEM specification ID, e.g, "NDR-4.0"
   * @param {string} [ruleNumber] - NIEM specification rule number
   * @param {string} [validExample] - An example that would pass the test
   * @param {string} [invalidExample] - An example that would fail the test
   * @param {string} [exceptions] - Free-text description of allowed exceptions
   * @param {string} [exceptionIDs] - Comma-delimited list of ids for allowed exceptions
   * @param {string} [notes] - Other details or comments about the test
   * @param {boolean} [ran=false] - True if a test ran; false otherwise
   */
  constructor(id, description, category, component, field, scope, source, severity, specID="", ruleNumber="", validExample, invalidExample, exceptions, exceptionIDs="", notes, ran=false) {

    this.id = id;
    this.description = description;
    this.category = category;
    this.component = component;
    this.field = field;
    this.scope = scope;
    this.source = source;
    this.severity = severity;
    this.specID = specID.replace(" ", "-");
    this.specURL = "";
    this.ruleNumber = ruleNumber;
    this.ruleURL = "";
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

    if (this.specID) {
      let [suiteID, versionID] = this.specID.split("-");
      this.ruleURL = specLib.ruleURL(suiteID, versionID, this.ruleNumber);
    }

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
       * @param {string[]} prefixes - Filters test issues on the given namespace prefix.
       * @return {Issue[]}
       */
      issues(prefixes=[]) {
        if (prefixes.length == 0) return self.issues;
        if (!self.issues || self.issues.length == 0) return [];
        return self.issues.filter( issue => prefixes.includes(issue.prefix) );
      },

      /**
       * Unique array of namespace prefixes with issues.
       * @returns {string[]}
       */
      prefixes() {
        if (self.issues.length == 0) return [];
        let prefixes = self.issues.map( issue => issue.prefix );
        return [ ...(new Set(prefixes)) ];
      },

      /**
       * True if the test ran and has no issues, optionally filtered by the given prefixes.
       * @param {string[]} prefixes - Filters results for the given prefix.
       * @returns {Boolean}
       */
      passed(prefixes) {
        return self.ran && self.namespaces.issues(prefixes).length == 0;
      },

      /**
       * True if the test ran and has issues, optionally filtered by the given prefixes.
       * @param {string[]} prefixes - Filters results for the given prefix.
       * @returns {Boolean}
       */
      failed(prefixes) {
        return self.ran && self.namespaces.issues(prefixes).length > 0;
      },

      /**
       * Test status based on if the test ran and has issues.
       * @param {string[]} prefixes - Filters results for the given prefix.
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
