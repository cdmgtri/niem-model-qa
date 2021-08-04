
let NIEMObjectTester = require("../niem-object/index");
let LocalTermUnitTests = require("./unit");
let { ReleaseDef, LocalTermDef } = require("niem-model").TypeDefs;

class LocalTermTester extends NIEMObjectTester {

  constructor(qa) {

    super(qa);

    this.tests = new LocalTermUnitTests(qa);

    /**
     * @param {LocalTermDef[]} localTerms
     * @param {ReleaseDef} release
     * @return {Promise<NIEMModelQA>}
     */
    this.run = (localTerms, release) => this.runTests(localTerms, release);

    this.field = {

      /**
       * @param {LocalTermDef[]} localTerms
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      definition: (localTerms, release) => this.runTests(localTerms, release, "definition"),

      /**
       * @param {LocalTermDef[]} localTerms
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      literal: (localTerms, release) => this.runTests(localTerms, release, "literal"),

      /**
       * @param {LocalTermDef[]} localTerms
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      term: (localTerms, release) => this.runTests(localTerms, release, "term"),

    }

  }

}

const NIEMModelQA = require("../../index");

module.exports = LocalTermTester;
