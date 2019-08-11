
let NIEMObjectUnitTests = require("../../niem-object/unit/index");

let { Release, Facet } = require("niem-model-source").ModelObjects;

/**
 * Facet unit tests
 */
class FacetUnitTests extends NIEMObjectUnitTests {

  /**
   * @param {Facet[]} facets
   * @param {Release} release
   */
  async type_unknown(facets, release) {
    return this.type_unknown__helper("facet_type_unknown", facets, release);
  }

}

module.exports = FacetUnitTests;
