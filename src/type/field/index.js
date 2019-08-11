
let NIEMObjectFieldTests = require("../../niem-object/field/index");
let TypeUnitTests = require("../unit/index");
let { Release, Type } = require("niem-model-source").ModelObjects;

class TypeFieldTests extends NIEMObjectFieldTests {

  /**
   * @param {TypeUnitTests} unitTests
   */
  constructor(unitTests) {
    super(unitTests);
    this.unitTests = unitTests;
  }

  /**
   * @param {Type[]} types
   * @param {Release} release
   */
  async base(types, release) {
    return this.testSuite(types, release, "base");
  }

  /**
   * @param {Type[]} types
   * @param {Release} release
   */
  async definition(types, release) {
    return this.testSuite(types, release, "definition");
  }

  /**
   * @param {Type[]} types
   * @param {Release} release
   */
  async name(types, release) {
    return this.testSuite(types, release, "name");
  }

  /**
   * @param {Type[]} types
   * @param {Release} release
   */
  async prefix(types, release) {
    return this.testSuite(types, release, "prefix");
  }

  /**
   * @param {Type[]} types
   * @param {Release} release
   */
  async style(types, release) {
    return this.testSuite(types, release, "style");
  }

  /**
   * @param {Type[]} types
   * @param {Release} release
   */
  async all(types, release) {
    return super.all(types, release);
  }

}

module.exports = TypeFieldTests;
