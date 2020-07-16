
let NIEMObjectQA = require("../niem-object/index");
let FacetUnitTests = require("./unit");

class FacetQA extends NIEMObjectQA {

  constructor(testSuite, utils) {

    super(testSuite);

    this.test = new FacetUnitTests(testSuite, utils);

    /**
     * @param {Facet[]} facets
     * @param {Release} release
     * @returns {Promise<NIEMModelQA>}
     */
    this.all = (facets, release) => this.runTests(facets, release);

    this.field = {

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       * @returns {Promise<NIEMModelQA>}
       */
      definition: (facets, release) => this.runTests(facets, release, "definition"),

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       * @returns {Promise<NIEMModelQA>}
       */
      style: (facets, release) => this.runTests(facets, release, "style"),

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       * @returns {Promise<NIEMModelQA>}
       */
      type: (facets, release) => this.runTests(facets, release, "type"),

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       * @returns {Promise<NIEMModelQA>}
       */
      value: (facets, release) => this.runTests(facets, release, "value")

    }

  }

}

module.exports = FacetQA;

let NIEMModelQA = require("../../index");
let { Release, Facet } = require("niem-model");
