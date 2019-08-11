
let NIEMObjectUnitTests = require("../../niem-object/unit/index");

let { Release, Facet } = require("niem-model-source").ModelObjects;

/**
 * Facet unit tests
 */
class FacetUnitTests extends NIEMObjectUnitTests {

  /**
   * Check that code facets have definitions.
   *
   * @example // Code facet 'MON' should have a definition (e.g., 'Monday').
   * @example // Length facet '10' is not required to have a definition.
   *
   * @param {Facet[]} facets
   */
  async definition_missing_code(facets) {
    let problemFacets = facets.filter( facet => {
      return facet.kind == "enumeration" && ! facet.definition
    });
    return this.testSuite.post("facet_definition_missing_code", problemFacets, "definition");
  }

  /**
   * Check that code facets have definitions.
   *
   * @example // Pattern facets should have definitions
   * @example // Length facet '10' is not required to have a definition.
   *
   * @param {Facet[]} facets
   */
  async definition_missing_pattern(facets) {
    let problemFacets = facets.filter( facet => {
      return facet.kind == "pattern" && ! facet.definition
    });
    return this.testSuite.post("facet_definition_missing_pattern", problemFacets, "definition");
  }

  /**
   * Check that facet kinds match the list from XML schema.
   *
   * @example // Facet 'MON' can have kind 'enumeration'.
   * @example // Facet 'MON' cannot have kind 'code' or 'ENUM'.
   *
   * @param {Facet[]} facets
   */
  async kind_invalid(facets) {
    let problemFacets = facets.filter( facet => {
      return ! facet.kind || ! Facet.KindValues.includes(facet.kind)
    });
    return this.testSuite.post("facet_kind_invalid", problemFacets, "kind");
  }

  /**
   * Check for facets on complex types.
   *
   * @example // Code 'MON' can belong to simple type 'WeekdayCodeSimpleType'.
   * @example // Code 'MON' cannot belong to complex object type 'nc:PersonType'.
   *
   * @param {Facet[]} facets
   * @param {Release} release
   */
  async type_complex(facets, release) {

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

    return this.testSuite.post("facet_type_complex", problemFacets, "typeQName");
  }

  /**
   * Check that code facets belong to a type with a name that ends with "CodeSimpleType".
   *
   * @example // Code 'MON' can belong to a type named 'WeekdayCodeSimpleType'.
   * @example // Code 'MON' cannot belong to a type named 'WeekdaySimpleType'.
   *
   * @param {Facet[]} facets
   */
  async type_repTerm_code(facets) {

    let problemFacets = facets
    .filter( facet => facet.typeName && facet.kind == "enumeration" )
    .filter( facet => ! facet.typeName.endsWith("CodeSimpleType") );

    return this.testSuite.post("facet_type_repTerm_code", problemFacets, "typeQName");
  }

  /**
   * Check for missing or unknown types.
   *
   * @param {Facet[]} facets
   * @param {Release} release
   */
  async type_unknown(facets, release) {
    return this.type_unknown__helper("facet_type_unknown", facets, release);
  }

  /**
   * Check for duplicate code facets within a type.
   *
   * @example // Type 'WeekdayCodeSimpleType' with codes 'MON', 'TUE', 'WED', ...
   * @example // Type 'WeekdayCodeSimpleType' with codes 'MON', 'MON', 'MON', ...
   *
   * @param {Facet[]} facets
   */
  async value_duplicate_code(facets) {

    // Check for types that have duplicate facets
    let labelCounts = {};

    facets
    .filter( facet => facet.kind == "enumeration" )
    .forEach( facet => {
      let label = facet.label;
      labelCounts[label] = label in labelCounts ? labelCounts[label] + 1 : 1;
    });

    let problemFacets = facets
    .filter( facet => facet.kind == "enumeration" )
    .filter( facet => labelCounts[facet.label] > 1 );

    return this.testSuite.post("facet_value_duplicate_code", problemFacets, "value");

  }

  /**
   * Check for missing facet values.
   *
   * @param {Facet[]} facets
   */
  async value_missing(facets) {
    let problemFacets = facets.filter( facet => ! facet.value );
    return this.testSuite.post("facet_value_missing", problemFacets, "value");
  }

}

module.exports = FacetUnitTests;
