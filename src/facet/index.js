
let NIEMObjectQA = require("../niem-object");
let FacetUnitTests = require("./unit");

class FacetQA extends NIEMObjectQA {

  constructor(testSuite) {

    super(testSuite);

    this.test = new FacetUnitTests(testSuite);

    /**
     * @param {Facet[]} facets
     * @param {Release} release
     */
    this.all = (facets, release) => this.runTests(facets, release);

    this.field = {

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       */
      definition: (facets, release) => this.runTests(facets, release, "definition"),

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       */
      style: (facets, release) => this.runTests(facets, release, "style"),

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       */
      type: (facets, release) => this.runTests(facets, release, "type"),

      /**
       * @param {Facet[]} facets
       * @param {Release} release
       */
      value: (facets, release) => this.runTests(facets, release, "value")

    }

  }

}

module.exports = FacetQA;

let { Release, Facet } = require("niem-model");
