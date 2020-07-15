
let NIEMObjectQA = require("../niem-object/index");
let FacetUnitTests = require("./unit");
let QATestSuite = require("../../test-suite/index");

class FacetQA extends NIEMObjectQA {

  constructor(testSuite, utils) {

    super(testSuite);

    this.test = new FacetUnitTests(testSuite, utils);

    /**
     * @param {Facet[]} facets
     * @param {Release} release
     * @returns {Promise<QATestSuite>}
     */
    this.all = (facets, release) => this.runTests(facets, release);

    this.field = {

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       * @returns {Promise<QATestSuite>}
       */
      definition: (facets, release) => this.runTests(facets, release, "definition"),

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       * @returns {Promise<QATestSuite>}
       */
      style: (facets, release) => this.runTests(facets, release, "style"),

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       * @returns {Promise<QATestSuite>}
       */
      type: (facets, release) => this.runTests(facets, release, "type"),

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       * @returns {Promise<QATestSuite>}
       */
      value: (facets, release) => this.runTests(facets, release, "value")

    }

  }

}

module.exports = FacetQA;

let { Release, Facet } = require("niem-model");
