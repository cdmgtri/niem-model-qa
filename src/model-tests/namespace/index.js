
let NIEMObjectQA = require("../niem-object/index");
let NamespaceUnitTests = require("./unit");
let { Release, Namespace } = require("niem-model");

class NamespaceQA extends NIEMObjectQA {

  constructor(testSuite, utils) {

    super(testSuite);

    this.test = new NamespaceUnitTests(testSuite, utils);

    /**
     * @param {Namespace[]} namespaces
     * @param {Release} release
     * @return {Promise<NIEMModelQA>}
     */
    this.all = (namespaces, release) => this.runTests(namespaces, release);

    this.field = {

      /**
       * @param {Namespace[]} namespaces
       * @param {Release} release
       * @returns {Promise<NIEMModelQA>}
       */
      definition: (namespaces, release) => this.runTests(namespaces, release, "definition")

    }

  }

}

const NIEMModelQA = require("../../index");

module.exports = NamespaceQA;
