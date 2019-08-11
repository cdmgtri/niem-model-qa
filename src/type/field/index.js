
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
  async base(types, release) {

    let tests = [
      (await this.unitTests.base_invalid_csc(types, release)),
      (await this.unitTests.base_invalid_simple(types, release)),
      (await this.unitTests.base_missing_simpleContent(types)),
      (await this.unitTests.base_unknown(types, release)),
    ];

    return TestSuite.init(tests);
  }

  /**
   * @param {Type[]} types
   * @param {Release} release
   */
  async definition(types, release) {

    let tests = [
      (await this.unitTests.def_missing_complex(types)),
      (await this.unitTests.def_missing_simple(types)),
      (await this.unitTests.def_phrase_complex(types)),
      (await this.unitTests.def_phrase_simple(types)),
      (await this.unitTests.def_spellcheck(types, release)),
    ];

    return TestSuite.init(tests);
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

  /**
   * @param {Type[]} types
   * @param {Release} release
   */
  async prefix(types, release) {

    let tests = [
      (await this.unitTests.prefix_missing(types)),
      (await this.unitTests.prefix_unknown(types, release)),
    ];

    return TestSuite.init(tests);
  }

}

module.exports = TypeQA_FieldTestSuites;
