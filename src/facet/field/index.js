
let NIEMObjectFieldTests = require("../../niem-object/field/index");
let FacetQAUnitTests = require("../unit/index");
let { Release, Facet } = require("niem-model");

class FacetFieldTests extends NIEMObjectFieldTests {

  /**
   * @param {FacetQAUnitTests} unitTests
   */
  constructor(unitTests) {
    super(unitTests);
    this.unitTests = unitTests;
  }

  /**
   * @param {Facet[]} facets
   * @param {Release} release
   */
  async definition(facets, release) {
    return this.testSuite(facets, release, "definition");
  }

  /**
   * @param {Facet[]} facets
   * @param {Release} release
   */
  async style(facets, release) {
    return this.testSuite(facets, release, "style");
  }

  /**
   * @param {Facet[]} facets
   * @param {Release} release
   */
  async type(facets, release) {
    return this.testSuite(facets, release, "type");
  }

  /**
   * @param {Facet[]} facets
   * @param {Release} release
   */
  async value(facets, release) {
    return this.testSuite(facets, release, "value");
  }


}

module.exports = FacetFieldTests;
