
let ComponentQA = require("../component/index");

let TypeQA_UnitTests = require("./unit/index");
let TypeQA_FieldTestSuites = require("./field/index");

class TypeQA extends ComponentQA {

  constructor(testSuite) {

    super(testSuite);

    /** @private */
    this.unitTests = new TypeQA_UnitTests(testSuite);

    /** @private */
    this.fieldTestSuites = new TypeQA_FieldTestSuites(this.test);
  }

  /**
   * Individual Type unit tests
   * @type {TypeQA_UnitTests}
   */
  get test() {
    return this.unitTests;
  }

  /**
   * A Type test suite made up of unit tests related to a particular Type field.
   * @type {TypeQA_FieldTestSuites}
   */
  get field() {
    return this.fieldTestSuites;
  }

}

module.exports = TypeQA;
