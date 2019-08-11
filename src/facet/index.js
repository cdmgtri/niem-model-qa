
let NIEMObjectQA = require("../niem-object/index");

let FacetUnitTests = require("./unit/index");
let FacetFieldTests = require("./field/index");

class FacetQA extends NIEMObjectQA {

  constructor(testSuite) {

    super(testSuite);
    this.testSuite = testSuite;

    /** @private */
    this.unitTests = new FacetUnitTests(this.testSuite);

    /** @private */
    this.fieldTests = new FacetFieldTests(this.unitTests);

  }

  /**
   * Individual Facet unit tests
   * @type {FacetUnitTests}
   */
  get test() {
    return this.unitTests;
  }

  /**
   * A Facet test suite made up of unit tests related to a particular Facet field.
   * @type {FacetFieldTests}
   */
  get field() {
    return this.fieldTests;
  }


}

module.exports = FacetQA;
