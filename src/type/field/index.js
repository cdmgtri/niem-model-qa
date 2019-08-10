
let { Release, Type } = require("niem-model-source").ModelObjects;

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
   * @param {Release} release
   */
  async name(types, release) {

    let tests = [
      (await this.unitTests.name_camelCase(types)),
      (await this.unitTests.name_duplicate(types)),
      (await this.unitTests.name_missing_complex(types)),
      (await this.unitTests.name_missing_simple(types)),
      (await this.unitTests.name_invalidChar(types)),
      (await this.unitTests.name_repTerm_type(types)),
      (await this.unitTests.name_repTerm_simple(types)),
      (await this.unitTests.name_repTerm_complex(types)),
      (await this.unitTests.name_repTerm_codeType(types)),
      (await this.unitTests.name_inconsistent_codeType(types)),
      (await this.unitTests.name_repTerm_codeSimpleType(types)),
      (await this.unitTests.name_reservedTerm_type(types)),
      (await this.unitTests.name_spellcheck(types, release)),
    ];

    return TestSuite.init(tests);
  }

}

module.exports = TypeQA_FieldTestSuites;
