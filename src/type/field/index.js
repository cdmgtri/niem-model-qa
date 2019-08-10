
let { Type } = require("niem-model-source").ModelObjects;

let TypeUnitTests = require("../unit/index");
let TestSuite = require("../../test-suite/index");

class TypeQA_FieldTestSuites {

  /**
   * @param {TypeUnitTests} unitTests
   */
  constructor(unitTests) {
    this.unitTests = unitTests;
  }

  /**
   * @param {Type[]} types
   */
  async name(types) {

    let tests = [
      (await this.unitTests.name_missing_complex(types)),
      (await this.unitTests.name_missing_simple(types)),
      (await this.unitTests.name_invalidChar(types)),
      (await this.unitTests.name_repTerm_type(types)),
      (await this.unitTests.name_repTerm_simple(types)),
      (await this.unitTests.name_repTerm_complex(types)),
      (await this.unitTests.name_repTerm_codeType(types)),
      (await this.unitTests.name_inconsistent_codeType(types)),
      (await this.unitTests.name_repTerm_codeSimpleType(types)),
    ];

    return TestSuite.init(tests);
  }

}

module.exports = TypeQA_FieldTestSuites;
