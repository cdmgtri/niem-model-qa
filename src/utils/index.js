
let { TypeDefs } = require("niem-model");
let { ReleaseDef, ComponentDef, NIEMObjectDef } = TypeDefs;

let Test = require("../test");
let Issue = require("../issue");

/** @private */
let NamespaceOrComponent = {
  ...NIEMObjectDef,
  prefix: "",
  definition: "",
  label: ""
}

class Utils {

  /**
   * @param {NIEMModelQA} qa
   */
  constructor(qa) {
    this.qa = qa;
  }

  get spellChecker() {
    return this.qa.spellChecker;
  }

  /**
   * Checks that the qualified property field of the object exists in the release.
   *
   * @param {Test} test
   * @param {NIEMObjectDef[]} objects
   * @param {ReleaseDef} release
   * @param {string} [qnameField="propertyQName"] Qualified property field to check
   */
  async property_unknown__helper(test, objects, release, qnameField="propertyQName") {

    return this.component_unknown__helper(test, objects, release, "properties", qnameField);

  }

  /**
   * Checks that the qualified type field of the object exists in the release.
   *
   * @param {Test} test
   * @param {NIEMObjectDef[]} objects
   * @param {ReleaseDef} release
   * @param {string} [qnameField="typeQName"] Qualified type field to check
   */
  async type_unknown__helper(test, objects, release, qnameField="typeQName") {

    return this.component_unknown__helper(test, objects, release, "types", qnameField);

  }


  /**
   * Checks that the qualified component field of the object exists in the release.
   *
   * @param {Test} test
   * @param {NIEMObjectDef[]} objects
   * @param {ReleaseDef} release
   * @param {"types"|"properties"} sourceField - Release object to search for component
   * @param {string} [qnameField="typeQName"] Qualified component field to check
   */
  async component_unknown__helper(test, objects, release, sourceField, qnameField) {

    test.start();

    /** @type {NIEMObjectDef[]} */
    let problemObjects = [];

    /** @type {string[]} */
    let uniqueQNames = [...new Set( objects.map( object => object[qnameField]) )];

    /** @type {string[]} */
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

    return this.qa.tests.post(test, problemObjects, qnameField);
  }

  /**
   * Checks that a component name is not repeated in a namespace.
   * Note: Case insensitive, so it will report elements and attributes with the same name.

   * @param {Test} test
   * @param {ComponentDef[]} components
   * @param {"qname"|"name"} nameField - Check for duplicate names within a single namespace or the full release
   */
  async name_duplicate__helper(test, components, nameField="qname") {

    /** @type {Object<string, number>} */
    let counts = {};

    // Kinds of components to ignore due to expected overlap
    let ignoreList = ["Augmentation", "AugmentationPoint", "Code", "Metadata"];

    if (nameField == "name") {
      // Do not compare augmentations and codes - these are expected to have some overlap
      components = components
      .filter( component => component.name )
      .filter( component => {
        let nameBase = component.name.replace(/Type$/, "").replace(/Simple$/, "");
        return !ignoreList.some( term => nameBase.endsWith(term) );
      });
    }

    components.forEach( component => {
      // Record the count of the number of occurrences of each component name/qname
      let nameValue = component[nameField].toLowerCase();
      counts[nameValue] = (counts[nameValue] || 0) + 1;
    });

    /** @type {ComponentDef[]} */
    let problemComponents = [];

    for (let nameValue in counts) {
      if (counts[nameValue] > 1) {
        problemComponents.push(...components.filter(component => component[nameField].toLowerCase() == nameValue));
      }
    }

    /**
     * @param {ComponentDef} component
     */
    let commentFunction = (component) => {
      if (component["typeQName"] || component["isAbstract"] == true) {
        return `Type: ${component["typeQName"]}\nDef: ${component.definition}`
      }
      if (component["baseQName"]) {
        return `Base: ${component["baseQName"]}\nDef: ${component.definition}`
      }
    }

    return this.qa.tests.post(test, problemComponents, nameField, commentFunction);
  }

  /**
   * @param {Test} test
   * @param {ComponentDef[]} components
   */
  name_invalidChar__helper(test, components) {
    let regex = /[^A-Za-z0-9_\-.]/;
    let problemComponents = components.filter( component => {
      return component.name && component.name.match(regex)
    });
    return this.qa.tests.post(test, problemComponents, "name");
  }

  /**
   * @param {Test} test
   * @param {ComponentDef[]} components
   */
  name_missing__helper(test, components) {
    let problemComponents = components.filter( component => ! component.name );
    return this.qa.tests.post(test, problemComponents, "name");
  }

  /**
   * Check the spelling of each term in a component name.  Check Local Terminology
   * if not found in dictionary.
   *
   * @param {Test} test
   * @param {Array<NamespaceOrComponent>} objects - Namespaces, properties, or types
   * @param {ReleaseDef} release
   */
  async definition_spellcheck__helper(test, objects, release) {

    /** @type {Issue[]} */
    let issues = [];

    // Check terms by namespace
    let prefixes = new Set(objects.map( component => component.prefix ));

    for (let prefix of prefixes) {
      let localTerms = await release.localTerms.find({prefix: prefix});
      let terms = localTerms.map( localTerm => localTerm.term );

      let objectsInNamespace = objects.filter( object => object.prefix == prefix && object.definition );

      for (let object of objectsInNamespace) {
        let unknownSpellings = await this.spellChecker.checkDefinition(object.definition, terms);

        for (let unknownSpelling of unknownSpellings) {
          // Log each unknown spelling as a new issue
          let issue = new Issue(object.prefix, object.label, object.input_location, object.input_line, unknownSpelling, object.definition);
          issues.push(issue);
        }
      }
    }

    return test.log(issues);

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
   * @param {Test} test
   * @param {NIEMObjectDef[]} objects
   * @param {string} field Object field to check the formatting of
   * @param {"all"|"nbsp"|"exclude-nbsp"} checks - Specify which checks to run
   */
  async text_formatting_helper(test, objects, field, checks="all") {

    if (!field) throw new Error("Field name required");

    let checkableObjects = objects.filter( object => object[field] );

    // Non-breaking space
    let nbsp = "\u00A0";

    /** @type {NIEMObjectDef[]} */
    let problemObjects = [];

    if (checks == "all" || checks == "exclude-nbsp") {
      // Check for all invalid characters excluding non-breaking spaces
      problemObjects.push(...checkableObjects.filter( object => {
        return object[field].match(/ {3,}|(?<!\.) {2,}|^ | $|\t|\r|\n|\f/);
      }));
    }

    if (checks == "all" || checks == "nbsp") {
      // Check for non-breaking spaces
      problemObjects.push(...checkableObjects.filter( object => object[field].match(nbsp) ));
    }


    let commentFunction = (object) => {
      return object[field]
      .replace(/\u00A0/g, "[NBSP]")
      .replace(/ {3,}/g, "[SPACES]")
      .replace(/(?<!\.) {2,}/g, "[SPACES]")
      .replace(/^ | $/g, "[SPACE]")
      .replace(/\t/g, "[TAB]")
      .replace(/\r|\n/g, "[NEW LINE]")
      .replace(/\f/g, "[FORM FEED]")
    }

    return this.qa.tests.post(test, problemObjects, field, commentFunction);

  }

  /**
   * Check the spelling of each term in a component name.  Check Local Terminology
   * if not found in dictionary.
   *
   * @param {Test} test
   * @param {ComponentDef[]} components
   * @param {ReleaseDef} release
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
              let issue = new Issue(component.prefix, component.label, component.input_location, component.input_line, nameTerm, component.qname);

              issues.push(issue);
            }
          }
        }
      }
    }

    return test.log(issues);
  }

  /**
   * Check that types have a namespace prefix that has been defined in the release.
   * @param {Test} test
   * @param {ComponentDef[]} components
   * @param {ReleaseDef} release
   */
  async prefix_unknown__helper(test, components, release) {

    /** @type {ComponentDef[]} */
    let problemComponents = [];

    /** @type {string[]} */
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

    return this.qa.tests.post(test, problemComponents, "prefix");
  }


}


/**
 * @private
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
