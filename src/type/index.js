
let ComponentQA = require("../component/index");

let TypeQA_UnitTests = require("./unit/index");
let TypeQA_FieldTestSuites = require("./field/index");

let { Test } = ComponentQA;
let { Release, Type } = ComponentQA.ModelObjects;

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

/**
 * @param {Test[]} tests
 * @param {Release} release
 */
async function checkTypes(tests, release) {

  let types = await release.types.find();
  let nonXSTypes = types.filter( type => type.prefix != "xs" && type.prefix != "niem-xs");

  checkPatterns(tests, nonXSTypes);

}

/**
 * Check that types have values for all required fields.
 *
 * @param {Test[]} tests
 * @param {Type[]} types
 */
function checkPatterns(tests, types) {

  // Missing patterns
  problemTypes = types.filter( type => ! type.pattern );
  logResults(tests, problemTypes, "type-style-all-missing");

}


module.exports = TypeQA;
