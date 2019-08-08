
let { Type } = require("niem-model-source").ModelObjects;

let TypeUnitTests = require("../unit/index");
let TestSuite = require("../../test-suite/index");

class TypeFieldTests {

  /**
   * @param {TypeUnitTests} unitTests
   */
  constructor(unitTests) {
    this.unitTests = unitTests;
  }

  /**
   * @param {Type[]} types
   */
  name(types) {

    let tests = [
      this.unitTests.name_missing_complex(types),
      this.unitTests.name_missing_simple(types),
      this.unitTests.name_invalidChar(types),
      this.unitTests.name_repTerm_type(types),
      this.unitTests.name_repTerm_simple(types),
      this.unitTests.name_repTerm_complex(types),
      this.unitTests.name_repTerm_codeType(types),
      this.unitTests.name_inconsistent_codeType(types),
    ];

    return TestSuite.init(tests);
  }

}

module.exports = TypeFieldTests;
