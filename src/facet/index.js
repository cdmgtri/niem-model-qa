
let NIEMTestSuite = require("niem-test-suite");
let NIEMObjectQA = require("../niem-object");
let FacetUnitTests = require("./unit");

class FacetQA extends NIEMObjectQA {

  constructor(testSuite, utils) {

    super(testSuite);

    this.test = new FacetUnitTests(testSuite, utils);

    /**
     * @param {Facet[]} facets
     * @param {Release} release
     * @returns {Promise<NIEMTestSuite>}
     */
    this.all = (facets, release) => this.runTests(facets, release);

    this.field = {

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       * @returns {Promise<NIEMTestSuite>}
       */
      definition: (facets, release) => this.runTests(facets, release, "definition"),

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       * @returns {Promise<NIEMTestSuite>}
       */
      style: (facets, release) => this.runTests(facets, release, "style"),

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       * @returns {Promise<NIEMTestSuite>}
       */
      type: (facets, release) => this.runTests(facets, release, "type"),

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       * @returns {Promise<NIEMTestSuite>}
       */
      value: (facets, release) => this.runTests(facets, release, "value")

    }

  }

}

module.exports = FacetQA;

let { Release, Facet } = require("niem-model");
