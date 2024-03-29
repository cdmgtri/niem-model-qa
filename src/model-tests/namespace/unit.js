
let NIEMObjectUnitTests = require("../niem-object/unit");
let { ReleaseDef, NamespaceDef } = require("niem-model").TypeDefs;
let Test = require("../../test");

class NamespaceUnitTests extends NIEMObjectUnitTests {

  /**
   * Check namespace definition use consistent formatting.
   *
   * - Two spaces are allowed after a period.  Other uses of multiple consecutive spaces are not allowed.
   * - Leading and trailing spaces are not allowed.
   *
   * @param {NamespaceDef[]} namespaces
   * @returns {Promise<Test>}
   */
  definition_formatting(namespaces) {
    let test = this.qa.tests.start("namespace_definition_formatting");
    return this.utils.text_formatting_helper(test, namespaces, "definition");
  }

  /**
   * @param {NamespaceDef[]} namespaces
   * @param {ReleaseDef} release
   */
  async definition_spellcheck(namespaces, release) {
    let test = this.qa.tests.start("namespace_definition_spellcheck");
    return this.utils.definition_spellcheck__helper(test, namespaces, release);
  }

}

module.exports = NamespaceUnitTests;
