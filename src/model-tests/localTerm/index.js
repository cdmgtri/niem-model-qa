
let NIEMObjectTester = require("../niem-object/index");
let LocalTermUnitTests = require("./unit");
let { Release, LocalTerm } = require("niem-model");

class LocalTermTester extends NIEMObjectTester {

  constructor(qa) {

    super(qa);

    this.tests = new LocalTermUnitTests(qa);

    /**
     * @param {LocalTerm[]} localTerms
     * @param {Release} release
     * @return {Promise<NIEMModelQA>}
     */
    this.run = (localTerms, release) => this.runTests(localTerms, release);

    this.field = {

      /**
       * @param {LocalTerm[]} localTerms
       * @param {Release} release
       * @returns {Promise<NIEMModelQA>}
       */
      definition: (localTerms, release) => this.runTests(localTerms, release, "definition"),

      /**
       * @param {LocalTerm[]} localTerms
       * @param {Release} release
       * @returns {Promise<NIEMModelQA>}
       */
      literal: (localTerms, release) => this.runTests(localTerms, release, "literal"),

      /**
       * @param {LocalTerm[]} localTerms
       * @param {Release} release
       * @returns {Promise<NIEMModelQA>}
       */
      term: (localTerms, release) => this.runTests(localTerms, release, "term"),

    }

  }

}

const NIEMModelQA = require("../../index");

module.exports = LocalTermTester;
