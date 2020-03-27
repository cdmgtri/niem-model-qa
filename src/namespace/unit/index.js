
let NIEMObjectUnitTests = require("../../niem-object/unit");
let { Release, Namespace } = require("niem-model");
let Test = require("../../test-suite/index");

class NamespaceUnitTests extends NIEMObjectUnitTests {

  /**
   * Check namespace definition use consistent formatting.
   *
   * - Two spaces are allowed after a period.  Other uses of multiple consecutive spaces are not allowed.
   * - Leading and trailing spaces are not allowed.
   *
   * @param {Property[]} namespaces
   * @returns {Promise<Test>}
   */
  definition_formatting(namespaces) {
    let test = this.testSuite.start("namespace_definition_formatting");
    return this.utils.definition_formatting_helper(test, namespaces);
  }

  /**
   * @param {Namespace[]} namespaces
   * @param {Release} release
   */
  async definition_spellcheck(namespaces, release) {
    let test = this.testSuite.start("namespace_definition_spellcheck");
    return this.utils.definition_spellcheck__helper(test, namespaces, release);
  }

}

module.exports = NamespaceUnitTests;
