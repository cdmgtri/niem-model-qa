
let NIEMObjectQA = require("../niem-object/index");
let FacetUnitTests = require("./unit");

class FacetQA extends NIEMObjectQA {

  constructor(testSuite) {

    super(testSuite);

    this.test = new FacetUnitTests(testSuite);

    this.all = this.loadTests();

    this.field = {

      definition: this.loadTests("definition"),

      style: this.loadTests("style"),

      type: this.loadTests("type"),

      value: this.loadTests("value")

    }

  }

  loadTests(field) {

    /**
     * @param {Facet[]} facets
     * @param {Release} release
     */
    let fn = (facets, release) => this.runTests(facets, release, field);
    return fn;
  }

}

module.exports = FacetQA;

let { Release, Facet } = require("niem-model");
