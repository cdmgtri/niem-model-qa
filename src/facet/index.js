
let NIEMObjectQA = require("../niem-object");
let FacetUnitTests = require("./unit");

class FacetQA extends NIEMObjectQA {

  constructor(testSuite) {

    super(testSuite);

    this.test = new FacetUnitTests(testSuite);

    /**
     * @param {Facet[]} facets
     * @param {Release} release
     * @returns {QATestSuite}
     */
    this.all = (facets, release) => this.runTests(facets, release);

    this.field = {

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       * @returns {QATestSuite}
       */
      definition: (facets, release) => this.runTests(facets, release, "definition"),

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       * @returns {QATestSuite}
       */
      style: (facets, release) => this.runTests(facets, release, "style"),

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       * @returns {QATestSuite}
       */
      type: (facets, release) => this.runTests(facets, release, "type"),

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       * @returns {QATestSuite}
       */
      value: (facets, release) => this.runTests(facets, release, "value")

    }

  }

}

module.exports = FacetQA;

let { Release, Facet } = require("niem-model");
let QATestSuite = require("../test-suite");
