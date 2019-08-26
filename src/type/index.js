
let NIEMObjectQA = require("../niem-object/index");

let TypeUnitTests = require("./unit/index");
let TypeFieldTests = require("./field/index");

class TypeQA extends NIEMObjectQA {

  constructor(testSuite) {

    super(testSuite);

    /** @private */
    this.unitTests = new TypeUnitTests(testSuite);

    /** @private */
    this.fieldTestSuites = new TypeFieldTests(this.test);
  }

  /**
   * Individual Type unit tests
   * @type {TypeUnitTests}
   */
  get test() {
    return this.unitTests;
  }

  /**
   * A Type test suite made up of unit tests related to a particular Type field.
   * @type {TypeFieldTests}
   */
  get field() {
    return this.fieldTestSuites;
  }

}

module.exports = TypeQA;
