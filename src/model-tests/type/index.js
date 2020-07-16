
let NIEMObjectQA = require("../niem-object");
let TypeUnitTests = require("./unit.js");

class TypeQA extends NIEMObjectQA {

  constructor(qa, utils) {

    super(qa);

    this.test = new TypeUnitTests(qa, utils);

    /**
     * @param {Type[]} types
     * @param {Release} release
     * @returns {Promise<NIEMModelQA>}
     */
    this.all = (types, release) => this.runTests(types, release);

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

module.exports = TypeQA;

let NIEMModelQA = require("../../index");
let { Release, Type } = require("niem-model");
