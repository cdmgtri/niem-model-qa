
let { Release, Facet } = require("niem-model");
let NIEMObjectUnitTests = require("../niem-object/unit");
let Test = require("../../test");

/**
 * Facet unit tests
 */
class FacetUnitTests extends NIEMObjectUnitTests {

  /**
   * Check that facet definitions use consistent formatting.
   *
   * @param {Facet[]} facets
   * @returns {Promise<Test>}
   */
  async definition_formatting(facets) {
    let test = this.qa.tests.start("facet_definition_formatting");
    return this.utils.text_formatting_helper(test, facets, "definition", "exclude-nbsp");
  }

  /**
   * Check that facet definitions do not contain non-breaking spaces.
   *
   * Note: This test is separate from the standard definition formatting check to
   * allow for certain code types with a valid reason to be listed as exceptions (e.g., country codes)
   *
   * @param {Facet[]} facets
   * @returns {Promise<Test>}
   */
  async definition_nbsp(facets) {
    let test = this.qa.tests.start("facet_definition_nbsp");
    return this.utils.text_formatting_helper(test, facets, "definition", "nbsp");
  }

  /**
   * Check that code facets have definitions.
   *
   * @example "Code facet 'MON' should have a definition (e.g., 'Monday')."
   * @example "Length facet '10' is not required to have a definition."
   *
   * @param {Facet[]} facets
   * @returns {Promise<Test>}
   */
  async definition_missing_code(facets) {

    let test = this.qa.tests.start("facet_definition_missing_code");

    let problemFacets = facets.filter( facet => {
      return facet.style == "enumeration" && ! facet.definition
    });

    return this.qa.tests.post(test, problemFacets, "definition");
  }

  /**
   * Check that code facets have definitions.
   *
   * @example "Pattern facets should have definitions"
   * @example "Length facet '10' is not required to have a definition."
   *
   * @param {Facet[]} facets
   * @returns {Promise<Test>}
   */
  async definition_missing_pattern(facets) {

    let test = this.qa.tests.start("facet_definition_missing_pattern");

    let problemFacets = facets.filter( facet => {
      return facet.style == "pattern" && ! facet.definition
    });

    return this.qa.tests.post(test, problemFacets, "definition");
  }

  /**
   * Check that facet kinds match the list from XML schema.
   *
   * @example "Facet 'MON' can have kind 'enumeration'."
   * @example "Facet 'MON' cannot have kind 'code' or 'ENUM'."
   *
   * @param {Facet[]} facets
   * @returns {Promise<Test>}
   */
  async style_invalid(facets) {

    let test = this.qa.tests.start("facet_kind_invalid");

    let problemFacets = facets.filter( facet => {
      return ! facet.style || ! Facet.Styles.includes(facet.style)
    });

    return this.qa.tests.post(test, problemFacets, "style");
  }

  /**
   * Check for facets on complex types.
   *
   * @example "Code 'MON' can belong to simple type 'WeekdayCodeSimpleType'."
   * @example "Code 'MON' cannot belong to complex object type 'nc:PersonType'."
   *
   * @param {Facet[]} facets
   * @param {Release} release
   * @returns {Promise<Test>}
   */
  async type_complex(facets, release) {

    let test = this.qa.tests.start("facet_type_complex");

    let uniqueTypeQNames = new Set( facets.map( facet => facet.typeQName) );

    /** @type {String[]} */
    let complexTypeQNames = [];

    /** @type {Facet[]} */
    let problemFacets = [];

    // Look up each type once to see if it is complex
    for (let qname of uniqueTypeQNames) {
      let type = await release.types.get(qname);
      if (type && type.isComplexType) complexTypeQNames.push(qname);
    }

    for (let qname of complexTypeQNames) {
      let matches = facets.filter( facet => facet.typeQName == qname );
      problemFacets.push(...matches);
    }

    return this.qa.tests.post(test, problemFacets, "typeQName");
  }

  /**
   * Check that code facets belong to a type with a name that ends with "CodeSimpleType".
   *
   * @example "Code 'MON' can belong to a type named 'WeekdayCodeSimpleType'."
   * @example "Code 'MON' cannot belong to a type named 'WeekdaySimpleType'."
   *
   * @param {Facet[]} facets
   * @returns {Promise<Test>}
   */
  async type_repTerm_code(facets) {

    let test = this.qa.tests.start("facet_type_repTerm_code");

    let problemFacets = facets
    .filter( facet => facet.typeName && facet.style == "enumeration" )
    .filter( facet => ! facet.typeName.endsWith("CodeSimpleType") );

    return this.qa.tests.post(test, problemFacets, "typeQName");
  }

  /**
   * Check for missing or unknown types.
   *
   * @param {Facet[]} facets
   * @param {Release} release
   * @returns {Promise<Test>}
   */
  async type_unknown(facets, release) {
    let test = this.qa.tests.start("facet_type_unknown");
    return this.utils.type_unknown__helper(test, facets, release);
  }

  /**
   * Check for duplicate code facets within a type.
   *
   * @example "Type 'WeekdayCodeSimpleType' with codes 'MON', 'TUE', 'WED', ..."
   * @example "Type 'WeekdayCodeSimpleType' with codes 'MON', 'MON', 'MON', ..."
   *
   * @param {Facet[]} facets
   * @returns {Promise<Test>}
   */
  async value_duplicate_code(facets) {

    let test = this.qa.tests.start("facet_value_duplicate_code");

    // Check for types that have duplicate facets
    let labelCounts = {};

    facets
    .filter( facet => !test.exceptionLabels.includes(facet.typeQName) )
    .filter( facet => facet.style == "enumeration" )
    .forEach( facet => {
      let label = facet.label;
      labelCounts[label] = label in labelCounts ? labelCounts[label] + 1 : 1;
    });

    let problemFacets = facets
    .filter( facet => !test.exceptionLabels.includes(facet.typeQName) )
    .filter( facet => facet.style == "enumeration" )
    .filter( facet => labelCounts[facet.label] > 1 );

    return this.qa.tests.post(test, problemFacets, "value", (facet) => "Definition: " + facet.definition);

  }

  /**
   * Check that facet values do not contain invalid characters
   *
   * @param {Facet[]} facets
   * @returns {Promise<Test>}
   */
  async value_formatting(facets) {
    let test = this.qa.tests.start("facet_value_formatting");
    return this.utils.text_formatting_helper(test, facets, "value");
  }

  /**
   * Check for missing facet values.
   *
   * @param {Facet[]} facets
   * @returns {Promise<Test>}
   */
  async value_missing(facets) {
    let test = this.qa.tests.start("facet_value_missing");
    let problemFacets = facets.filter( facet => ! facet.value );
    return this.qa.tests.post(test, problemFacets, "value");
  }

}

module.exports = FacetUnitTests;
