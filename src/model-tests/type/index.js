
let NIEMObjectTester = require("../niem-object");
let TypeUnitTests = require("./unit.js");

class TypeTester extends NIEMObjectTester {

  constructor(qa) {

    super(qa);

    this.tests = new TypeUnitTests(qa);

    /**
     * @param {TypeInstance[]} types
     * @param {ReleaseInstance} release
     * @returns {Promise<NIEMModelQA>}
     */
    this.run = (types, release) => this.runTests(types, release);

    this.field = {

      /**
       * @param {TypeInstance[]} types
       * @param {ReleaseInstance} release
       * @returns {Promise<NIEMModelQA>}
       */
      base: (types, release) => this.runTests(types, release, "base"),

      /**
       * @param {TypeInstance[]} types
       * @param {ReleaseInstance} release
       * @returns {Promise<NIEMModelQA>}
       */
      definition: (types, release) => this.runTests(types, release, "definition"),

      /**
       * @param {TypeInstance[]} types
       * @param {ReleaseInstance} release
       * @returns {Promise<NIEMModelQA>}
       */
      name: (types, release) => this.runTests(types, release, "name"),

      /**
       * @param {TypeInstance[]} types
       * @param {ReleaseInstance} release
       * @returns {Promise<NIEMModelQA>}
       */
      prefix: (types, release) => this.runTests(types, release, "prefix"),

      /**
       * @param {TypeInstance[]} types
       * @param {ReleaseInstance} release
       * @returns {Promise<NIEMModelQA>}
       */
      style: (types, release) => this.runTests(types, release, "style"),

    }

  }

}

module.exports = TypeTester;

let NIEMModelQA = require("../../index");
let { ReleaseInstance, TypeInstance } = require("niem-model");
