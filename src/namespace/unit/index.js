
let NIEMObjectUnitTests = require("../../niem-object/unit");
let { Release, Namespace } = require("niem-model");
let Test = require("../../test-suite/index");

class NamespaceUnitTests extends NIEMObjectUnitTests {

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
