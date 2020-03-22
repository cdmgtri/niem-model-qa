
let { Release, NIEMObject, Component } = require("niem-model");

let TestSuite = require("../test-suite/index");
let Test = require("../test-suite/test/index");
let Issue = require("../test-suite/issue/index");
let SpellChecker = require("./spellChecker");

class Utils {

  /**
   * @param {TestSuite} testSuite
   */
  constructor(testSuite) {
    this.testSuite = testSuite;
    this._spellChecker = new SpellChecker();
  }

  async init() {
    await this._spellChecker.init();
  }

  /**
   * Checks that the qualified property field of the object exists in the release.
   *
   * @param {Test} test
   * @param {NIEMObject[]} objects
   * @param {Release} release
   * @param {String} [qnameField="propertyQName"] Qualified property field to check
   */
  async property_unknown__helper(test, objects, release, qnameField="propertyQName") {

    return this.component_unknown__helper(test, objects, release, "properties", qnameField);

  }

  /**
   * Checks that the qualified type field of the object exists in the release.
   *
   * @param {Test} test
   * @param {NIEMObject[]} objects
   * @param {Release} release
   * @param {String} [qnameField="typeQName"] Qualified type field to check
   */
  async type_unknown__helper(test, objects, release, qnameField="typeQName") {

    return this.component_unknown__helper(test, objects, release, "types", qnameField);

  }


  /**
   * Checks that the qualified component field of the object exists in the release.
   *
   * @param {Test} test
   * @param {NIEMObject[]} objects
   * @param {Release} release
   * @param {"types"|"properties"} sourceField - Release object to search for component
   * @param {String} [qnameField="typeQName"] Qualified component field to check
   */
  async component_unknown__helper(test, objects, release, sourceField, qnameField) {

    test.start();

    /** @type {NIEMObject[]} */
    let problemObjects = [];

    /** @type {String[]} */
    let uniqueQNames = new Set( objects.map( object => object[qnameField]) );

    /** @type {String[]} */
    let undefinedQNames = [];

    // Only look up unique qnames; add to undefinedQNames array if not found
    for (let qname of uniqueQNames) {
      let component = await release[sourceField].get(qname);
      if (!component) undefinedQNames.push(qname);
    }

    undefinedQNames.forEach( qname => {
      let matches = objects.filter( object => object[qnameField] == qname );
      problemObjects.push(...matches);
    });

    return this.testSuite.post(test, problemObjects, qnameField);
  }

  /**
   * Checks that a component name is not repeated in a namespace.
   * @private
   * @param {Test} test
   * @param {Component[]} components
   */
  async name_duplicate__helper(test, components) {

    /** @type {{String: number}} */
    let counts = {};

    components.forEach( component => {
      let currentCount = counts[component.qname] ? counts[component.qname] : 0;
      counts[component.qname] = currentCount + 1;
    });

    /** @type {Component[]} */
    let problemComponents = [];

    for (let qname in counts) {
      if (counts[qname] > 1) {
        problemComponents.push( ...components.filter( component => component.qname == qname ) );
      }
    }

    return this.testSuite.post(test, problemComponents, "name");
  }

  /**
   * @private
   * @param {Test} test
   * @param {Component[]} components
   */
  name_invalidChar__helper(test, components) {
    let regex = /[^A-Za-z0-9_\-.]/;
    let problemComponents = components.filter( component => {
      return component.name && component.name.match(regex)
    });
    return this.testSuite.post(test, problemComponents, "name");
  }

  /**
   * @private
   * @param {Test} test
   * @param {Component[]} components
   */
  name_missing__helper(test, components) {
    let problemComponents = components.filter( component => ! component.name );
    return this.testSuite.post(test, problemComponents, "name");
  }

  /**
   * Check the spelling of each term in a component name.  Check Local Terminology
   * if not found in dictionary.
   *
   * @private
   * @param {Test} test
   * @param {Component[]} components
   * @param {Release} release
   */
  async definition_spellcheck__helper(test, components, release) {

    /** @type {Issue[]} */
    let issues = [];

    for (let component of components) {

      let definition = component.definition || "";

      // Get start and end positions for each misspelled word in the definition
      let unknownSpellings = await this._spellChecker.checkLongText(definition);

      for (let unknownSpelling of unknownSpellings) {

        // Check local terminology for the misspelled term
        let localTerm = await release.localTerms.get(component.prefix, unknownSpelling.word);

        if (! localTerm) {
          let issue = new Issue(component.prefix, component.label, component.input_location, component.input_line, component.source_position, unknownSpelling.word, component.definition);
          issues.push(issue);
        }
      }
    }

    return this.testSuite.log(test, issues);
  }

  /**
   * Check the spelling of each term in a component name.  Check Local Terminology
   * if not found in dictionary.
   *
   * @private
   * @param {Test} test
   * @param {Component[]} components
   * @param {Release} release
   */
  async name_spellcheck__helper(test, components, release) {

    /** @type {Issue[]} */
    let issues = [];

    for (let component of components) {
      for (let term of component.terms) {

        let correct = await this._spellChecker.checkWord(term);

        // Check for component term in dictionary
        if (!correct) {

          // Check for component term in Local Terminology
          let localTerm = await release.localTerms.get(component.prefix, term);

          if (!localTerm) {
            let issue = new Issue(component.prefix, component.label, component.source_location, component.source_line, component.source_position, term, component.qname);

            issues.push(issue);
          }
        }
      }
    }

    return this.testSuite.log(test, issues);
  }

  /**
   * Check that types have a namespace prefix that has been defined in the release.
   * @param {Test} test
   * @param {Component[]} components
   * @param {Release} release
   */
  async prefix_unknown__helper(test, components, release) {

    /** @type {Component[]} */
    let problemComponents = [];

    /** @type {String[]} */
    let undefinedPrefixes = [];

    let uniquePrefixes = new Set( components.map( component => component.prefix) );

    // Another test will check for missing prefixes
    uniquePrefixes.delete("");
    uniquePrefixes.delete(null);
    uniquePrefixes.delete(undefined);

    // Do lookups on the unique prefix set; add to undefinedPrefixes if not found
    for (let prefix of uniquePrefixes) {
      let ns = await release.namespaces.get(prefix);
      if (!ns) undefinedPrefixes.push(prefix);
    }

    // Add components with undefined prefixes to problemComponents array
    undefinedPrefixes.forEach( prefix => {
      let matches = components.filter( component => component.prefix == prefix );
      problemComponents.push(...matches);
    });

    return this.testSuite.post(test, problemComponents, "prefix");
  }


}

module.exports = Utils;
