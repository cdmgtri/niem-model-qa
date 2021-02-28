
let NIEMObjectTester = require("../niem-object/index");
let NamespaceUnitTests = require("./unit");
let { ReleaseInstance, NamespaceInstance } = require("niem-model");

class NamespaceTester extends NIEMObjectTester {

  constructor(qa) {

    super(qa);

    this.tests = new NamespaceUnitTests(qa);

    /**
     * @param {NamespaceInstance[]} namespaces
     * @param {ReleaseInstance} release
     * @return {Promise<NIEMModelQA>}
     */
    this.run = (namespaces, release) => this.runTests(namespaces, release);

    this.field = {

      /**
       * @param {NamespaceInstance[]} namespaces
       * @param {ReleaseInstance} release
       * @returns {Promise<NIEMModelQA>}
       */
      definition: (namespaces, release) => this.runTests(namespaces, release, "definition")

    }

  }

}

const NIEMModelQA = require("../../index");

module.exports = NamespaceTester;
