
let NIEMObjectQA = require("../niem-object/index");

let PropertyUnitTests = require("./unit/index");
// let PropertyFieldTest = require("./field/index");

class PropertyQA extends NIEMObjectQA {

  constructor(testSuite) {

    super(testSuite);

    /** @private */
    this.unitTests = new PropertyUnitTests(testSuite);

    /** @private */
    // this.fieldTestSuites = new PropertyFieldTest(this.test);
  }

  /**
   * Individual Property unit tests
   * @type {PropertyUnitTests}
   */
  get test() {
    return this.unitTests;
  }

  /**
   * A Type test suite made up of unit tests related to a particular Type field.
   * @type {PropertyFieldTests}
   */
  get field() {
    return this.fieldTestSuites;
  }

}

module.exports = PropertyQA;
