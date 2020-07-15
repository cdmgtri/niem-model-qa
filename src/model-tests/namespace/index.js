
let NIEMObjectQA = require("../niem-object/index");
let NamespaceUnitTests = require("./unit");
let QATestSuite = require("../../test-suite/index");
let { Release, Namespace } = require("niem-model");

class NamespaceQA extends NIEMObjectQA {

  constructor(testSuite, utils) {

    super(testSuite);

    this.test = new NamespaceUnitTests(testSuite, utils);

    /**
     * @param {Namespace[]} namespaces
     * @param {Release} release
     * @return {Promise<QATestSuite>}
     */
    this.all = (namespaces, release) => this.runTests(namespaces, release);

    this.field = {

      /**
       * @param {Namespace[]} namespaces
       * @param {Release} release
       * @returns {Promise<QATestSuite>}
       */
      definition: (namespaces, release) => this.runTests(namespaces, release, "definition")

    }

  }

}

module.exports = NamespaceQA;
