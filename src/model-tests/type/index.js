
let NIEMObjectTester = require("../niem-object");
let TypeUnitTests = require("./unit.js");

class TypeTester extends NIEMObjectTester {

  constructor(qa) {

    super(qa);

    this.tests = new TypeUnitTests(qa);

    /**
     * @param {TypeDef[]} types
     * @param {ReleaseDef} release
     * @returns {Promise<NIEMModelQA>}
     */
    this.run = (types, release) => this.runTests(types, release);

    this.field = {

      /**
       * @param {TypeDef[]} types
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      base: (types, release) => this.runTests(types, release, "base"),

      /**
       * @param {TypeDef[]} types
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      definition: (types, release) => this.runTests(types, release, "definition"),

      /**
       * @param {TypeDef[]} types
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      name: (types, release) => this.runTests(types, release, "name"),

      /**
       * @param {TypeDef[]} types
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      prefix: (types, release) => this.runTests(types, release, "prefix"),

      /**
       * @param {TypeDef[]} types
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      style: (types, release) => this.runTests(types, release, "style"),

      /**
       * @param {TypeDef[]} types
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      general: (types, release) => this.runTests(types, release, "general"),

    }

  }

}

module.exports = TypeTester;

let NIEMModelQA = require("../../index");
let { ReleaseDef, TypeDef } = require("niem-model").TypeDefs;
