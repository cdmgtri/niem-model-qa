
let NIEMObjectTester = require("../niem-object/index");
let FacetUnitTests = require("./unit");

class FacetTester extends NIEMObjectTester {

  constructor(qa, utils) {

    super(qa);

    this.test = new FacetUnitTests(qa, utils);

    /**
     * @param {Facet[]} facets
     * @param {Release} release
     * @returns {Promise<NIEMModelQA>}
     */
    this.run = (facets, release) => this.runTests(facets, release);

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

module.exports = FacetTester;

let NIEMModelQA = require("../../index");
let { Release, Facet } = require("niem-model");
