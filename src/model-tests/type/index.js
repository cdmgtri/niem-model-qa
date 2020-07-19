
let NIEMObjectTester = require("../niem-object");
let TypeUnitTests = require("./unit.js");

class TypeTester extends NIEMObjectTester {

  constructor(qa) {

    super(qa);

    this.tests = new TypeUnitTests(qa);

    /**
     * @param {Type[]} types
     * @param {Release} release
     * @returns {Promise<NIEMModelQA>}
     */
    this.run = (types, release) => this.runTests(types, release);

    this.field = {

      /**
       * @param {Type[]} types
       * @param {Release} release
       * @returns {Promise<NIEMModelQA>}
       */
      base: (types, release) => this.runTests(types, release, "base"),

      /**
       * @param {Type[]} types
       * @param {Release} release
       * @returns {Promise<NIEMModelQA>}
       */
      definition: (types, release) => this.runTests(types, release, "definition"),

      /**
       * @param {Type[]} types
       * @param {Release} release
       * @returns {Promise<NIEMModelQA>}
       */
      name: (types, release) => this.runTests(types, release, "name"),

      /**
       * @param {Type[]} types
       * @param {Release} release
       * @returns {Promise<NIEMModelQA>}
       */
      prefix: (types, release) => this.runTests(types, release, "prefix"),

      /**
       * @param {Type[]} types
       * @param {Release} release
       * @returns {Promise<NIEMModelQA>}
       */
      style: (types, release) => this.runTests(types, release, "style"),

    }

  }

}

module.exports = TypeTester;

let NIEMModelQA = require("../../index");
let { Release, Type } = require("niem-model");
