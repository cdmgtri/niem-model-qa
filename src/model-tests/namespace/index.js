
let NIEMObjectQA = require("../niem-object/index");
let NamespaceUnitTests = require("./unit");
let { Release, Namespace } = require("niem-model");

class NamespaceQA extends NIEMObjectQA {

  constructor(qa, utils) {

    super(qa);

    this.test = new NamespaceUnitTests(qa, utils);

    /**
     * @param {Namespace[]} namespaces
     * @param {Release} release
     * @return {Promise<NIEMModelQA>}
     */
    this.run = (namespaces, release) => this.runTests(namespaces, release);

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
