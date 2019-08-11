
let SpellChecker = require("spellchecker");

let { Issue } = require("niem-test-suite");
let { Release } = require("niem-model-source").ModelObjects;
let { Component } = require("niem-model-objects");

let NIEMObjectUnitTests = require("../../niem-object/unit/index");

class ComponentUnitTests extends NIEMObjectUnitTests {

  /**
   * Checks that a component name is not repeated in a namespace.
   * @private
   * @param {String} testID
   * @param {Component[]} components
   */
  async name_duplicate__helper(testID, components) {

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

    return this.testSuite.post(testID, problemComponents, "name");
  }

  /**
   * @private
   * @param {String} testID
   * @param {Component[]} components
   */
  name_invalidChar__helper(testID, components) {
    let regex = /[^A-Za-z0-9_\-.]/;
    let problemComponents = components.filter( component => component.name.match(regex) );
    return this.testSuite.post(testID, problemComponents, "name");
  }

  /**
   * @private
   * @param {String} testID
   * @param {Component[]} components
   */
  name_missing__helper(testID, components) {
    let problemComponents = components.filter( component => ! component.name );
    return this.testSuite.post(testID, problemComponents, "name");
  }

  /**
   * Check the spelling of each term in a component name.  Check Local Terminology
   * if not found in dictionary.
   *
   * @private
   * @param {String} testID
   * @param {Component[]} components
   * @param {Release} release
   */
  async definition_spellcheck__helper(testID, components, release) {

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

    return this.testSuite.log(testID, issues);
  }

  /**
   * Check the spelling of each term in a component name.  Check Local Terminology
   * if not found in dictionary.
   *
   * @private
   * @param {String} testID
   * @param {Component[]} components
   * @param {Release} release
   */
  async name_spellcheck__helper(testID, components, release) {

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

    return this.testSuite.log(testID, issues);
  }

  /**
   * Check that types have a namespace prefix that has been defined in the release.
   * @param {Component[]} components
   * @param {Release} release
   */
  async prefix_unknown__helper(components, release) {

    /** @type {Issue[]} */
    let issues = [];

    /** @type {String[]} */
    let undefinedPrefixes = [];

    // Components with prefixes
    let prefixedComponents = components.filter( type => type.prefix );

    // Unique prefixes
    let prefixes = new Set( prefixedComponents.map( component => component.prefix) );

    for (let prefix of prefixes) {
      let ns = await release.namespaces.get(prefix);
      if (!ns) {
        undefinedPrefixes.push(prefix);
      }
    }

    undefinedPrefixes.forEach( prefix => {
      prefixedComponents
      .filter( component => component.prefix == prefix )
      .forEach( component => {
        let issue = new Issue(component.prefix, component.label, component.source_location, component.source_line, component.source_position, component.prefix);

        issues.push(issue);
      });
    });

    return this.testSuite.log("type_prefix_unknown", issues);
  }

}

module.exports = ComponentUnitTests;
