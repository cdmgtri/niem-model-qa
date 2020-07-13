
let NIEMObjectQA = require("../niem-object");
let TypeUnitTests = require("./unit");
let QATestSuite = require("../../test-suite/index");

class TypeQA extends NIEMObjectQA {

  constructor(testSuite, utils) {

    super(testSuite);

    this.test = new TypeUnitTests(testSuite, utils);

    /**
     * @param {Type[]} types
     * @param {Release} release
     * @returns {Promise<QATestSuite>}
     */
    this.all = (types, release) => this.runTests(types, release);

    this.field = {

      /**
       * @param {Type[]} types
       * @param {Release} release
       * @returns {Promise<QATestSuite>}
       */
      base: (types, release) => this.runTests(types, release, "base"),

      /**
       * @param {Type[]} types
       * @param {Release} release
       * @returns {Promise<QATestSuite>}
       */
      definition: (types, release) => this.runTests(types, release, "definition"),

      /**
       * @param {Type[]} types
       * @param {Release} release
       * @returns {Promise<QATestSuite>}
       */
      name: (types, release) => this.runTests(types, release, "name"),

      /**
       * @param {Type[]} types
       * @param {Release} release
       * @returns {Promise<QATestSuite>}
       */
      prefix: (types, release) => this.runTests(types, release, "prefix"),

      /**
       * @param {Type[]} types
       * @param {Release} release
       * @returns {Promise<QATestSuite>}
       */
      style: (types, release) => this.runTests(types, release, "style"),

    }

  }

}

module.exports = TypeQA;

let { Release, Type } = require("niem-model");
