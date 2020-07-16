
let { Release, NIEMObject, Component } = require("niem-model");

let Test = require("../test");
let Issue = require("../test-suite/issue/index");

class Utils {

  /**
   * @param {NIEMModelQA} qa
   */
  constructor(qa) {
    this.testSuite = qa.testSuite;
    this.qa = qa;
    this.spellChecker = qa.spellChecker;
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

    return this.qa.testMetadata.post(test, problemObjects, qnameField);
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

    return this.qa.testMetadata.post(test, problemComponents, "name");
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
    return this.qa.testMetadata.post(test, problemComponents, "name");
  }

  /**
   * @private
   * @param {Test} test
   * @param {Component[]} components
   */
  name_missing__helper(test, components) {
    let problemComponents = components.filter( component => ! component.name );
    return this.qa.testMetadata.post(test, problemComponents, "name");
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

    // Check terms by namespace
    let prefixes = new Set(components.map( component => component.prefix ));

    for (let prefix of prefixes) {
      let localTerms = await release.localTerms.find({prefix: prefix});
      let terms = localTerms.map( localTerm => localTerm.term );

      let namespaceComponents = components.filter( component => component.prefix == prefix );

      for (let component of namespaceComponents) {
        let definition = component.definition || "";

        let unknownSpellings = await this.spellChecker.checkDefinition(definition, terms);

        for (let unknownSpelling of unknownSpellings) {

          // Check local terminology for the misspelled term
          let localTerm = await release.localTerms.get(component.prefix, unknownSpelling.word);

          if (! localTerm) {
            let issue = new Issue(component.prefix, component.label, component.input_location, component.input_line, component.source_position, unknownSpelling.word, component.definition);
            issues.push(issue);
          }
        }
      }
    }

    return this.testSuite.log(test, issues);
  }

  /**
   * Check the formatting of a definition for consistency.
   *
   * Checks for:
   * - 2 spaces that do not appear after a period.
   * - 3 spaces
   * - Leading space
   * - Trailing space
   *
   * @private
   * @param {Test} test
   * @param {NIEMObject[]} objects
   * @param {string} field Object field to check the formatting of
   */
  async text_formatting_helper(test, objects, field) {

    if (!field) throw new Error("Field name required");

    let checkableObjects = objects.filter( object => object[field] );

    let problemObjects = checkableObjects
    .filter( component => component[field] && component[field].match(/ {3,}|(?<!\.) {2,}|^ | $/) );

    this.qa.testMetadata.post(test, problemObjects, field, () => "Leading, trailing, or multiple spaces detected");


    // Non-breaking space
    let nbsp = "\u00A0";

    problemObjects = checkableObjects.filter( object => object[field].match(nbsp) );

    return this.qa.testMetadata.post(test, problemObjects, field, (object) => "Non-breaking space detected: " + object[field].replace(nbsp, `-->${nbsp}<--`), false);

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

    // Check terms by namespace
    let prefixes = new Set(components.map( component => component.prefix ));

    for (let prefix of prefixes) {
      let localTerms = await release.localTerms.find({prefix: prefix});
      let terms = localTerms.map( localTerm => localTerm.term );

      let namespaceComponents = components.filter( component => component.prefix == prefix );

      for (let component of namespaceComponents) {

        let nameTerms = getNameTerms(component.name, this.spellChecker.specialTerms);

        for (let nameTerm of nameTerms) {

          let correct = await this.spellChecker.checkWord(nameTerm, terms);

          // Check for component term in dictionary
          if (!correct) {

            // Check for component term in Local Terminology
            let localTerm = await release.localTerms.get(component.prefix, nameTerm);

            if (!localTerm) {
              let issue = new Issue(component.prefix, component.label, component.source_location, component.source_line, component.source_position, nameTerm, component.qname);

              issues.push(issue);
            }
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

    return this.qa.testMetadata.post(test, problemComponents, "prefix");
  }


}


/**
 * @param {string} name
 * @param {string[]} specialTerms
 */
function getNameTerms(name, specialTerms) {

  if (!name) return [];

  /** @type {string[]} */
  let terms = [];

  // Parse out special terms first before splitting terms by camel case
  for (let specialTerm of specialTerms) {
    if (name.includes(specialTerm)) {
      terms.push(specialTerm);
      name = name.replace(specialTerm, "");
    }
  }

  // Add a space between a lowercase letter (or number) and an uppercase letter
  let s = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");

  // Add a space before the last letter in a series of uppercase letters or numbers
  s = s.replace(/([A-Z0-9])([A-Z][a-z])/g, "$1 $2");

  // Add a space before uppercase letters and the term "ID"
  s = s.replace(/([A-Z])(ID)/g, "$1 $2");

  // Replace an underscore with a space
  s = s.replace(/_/g, " ");

  // Remove leading or singular dashes
  s = s.replace(/ \- /g, "");
  s = s.replace(/$\-+/g, "");

  // Drop all {digits}To{digits}
  s = s.replace(/\d*To\d+/g, "").replace(/\d+To\d*/g, "");

  // Drop all Integer{digits} and Decimal{digits}
  s = s.replace(/(Integer)|(Decimal)\d*/g, "")

  return [...terms, ...s.split(" ")];

}

let NIEMModelQA = require("../index");

module.exports = Utils;
