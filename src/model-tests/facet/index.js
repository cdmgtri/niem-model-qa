
let NIEMObjectTester = require("../niem-object/index");
let FacetUnitTests = require("./unit");

class FacetTester extends NIEMObjectTester {

  constructor(qa) {

    super(qa);

    this.tests = new FacetUnitTests(qa);

    /**
     * @param {FacetInstance[]} facets
     * @param {ReleaseInstance} release
     * @returns {Promise<NIEMModelQA>}
     */
    this.run = (facets, release) => this.runTests(facets, release);

    this.field = {

      /**
       * @param {FacetInstance[]} facets
       * @param {ReleaseInstance} release
       * @returns {Promise<NIEMModelQA>}
       */
      definition: (facets, release) => this.runTests(facets, release, "definition"),

      /**
       * @param {FacetInstance[]} facets
       * @param {ReleaseInstance} release
       * @returns {Promise<NIEMModelQA>}
       */
      style: (facets, release) => this.runTests(facets, release, "style"),

      /**
       * @param {FacetInstance[]} facets
       * @param {ReleaseInstance} release
       * @returns {Promise<NIEMModelQA>}
       */
      type: (facets, release) => this.runTests(facets, release, "type"),

      /**
       * @param {FacetInstance[]} facets
       * @param {ReleaseInstance} release
       * @returns {Promise<NIEMModelQA>}
       */
      value: (facets, release) => this.runTests(facets, release, "value")

    }

  }

}

module.exports = FacetTester;

let NIEMModelQA = require("../../index");
let { ReleaseInstance, FacetInstance } = require("niem-model");
