
let NIEMObjectTester = require("../niem-object/index");
let NamespaceUnitTests = require("./unit");
let { ReleaseDef, NamespaceDef } = require("niem-model").TypeDefs;

class NamespaceTester extends NIEMObjectTester {

  constructor(qa) {

    super(qa);

    this.tests = new NamespaceUnitTests(qa);

    /**
     * @param {NamespaceDef[]} namespaces
     * @param {ReleaseDef} release
     * @return {Promise<NIEMModelQA>}
     */
    this.run = (namespaces, release) => this.runTests(namespaces, release);

    this.field = {

      /**
       * @param {NamespaceDef[]} namespaces
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      definition: (namespaces, release) => this.runTests(namespaces, release, "definition")

    }

  }

}

const NIEMModelQA = require("../../index");

module.exports = NamespaceTester;
