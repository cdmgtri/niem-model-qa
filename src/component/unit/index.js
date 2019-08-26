
let SpellChecker = require("spellchecker");

let { Test, Issue } = require("niem-test-suite");
let { Release, Component } = require("niem-model");

let NIEMObjectUnitTests = require("../../niem-object/unit/index");

class ComponentUnitTests extends NIEMObjectUnitTests {

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
    let problemComponents = components.filter( component => component.name.match(regex) );
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
      let misspelledRanges = await SpellChecker.checkSpellingAsync(definition);

      // Translate the misspelled position ranges to misspelled terms
      let misspelledTerms = misspelledRanges.map( range => {
        return component.definition.slice(range.start, range.end);
      });

      for (let term of misspelledTerms) {

        // Check local terminology for the misspelled term
        let localTerm = await release.localTerms.get(component.prefix, term);

        if (! localTerm) {
          let issue = new Issue(component.prefix, component.label, component.source_location, component.source_line, component.source_position, term);

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

        // Check for component term in dictionary
        if (SpellChecker.isMisspelled(term)) {

          // Check for component term in Local Terminology
          let localTerm = await release.localTerms.get(component.prefix, term);

          if (!localTerm) {
            let issue = new Issue(component.prefix, component.label, component.source_location, component.source_line, component.source_position, term);

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

module.exports = ComponentUnitTests;
