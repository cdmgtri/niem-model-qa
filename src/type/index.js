
let NIEMObjectQA = require("../niem-object");
let TypeUnitTests = require("./unit");

class TypeQA extends NIEMObjectQA {

  constructor(testSuite) {

    super(testSuite);

    this.test = new TypeUnitTests(testSuite);

    /**
     * @param {Type[]} types
     * @param {Release} release
     */
    this.all = (types, release) => this.runTests(types, release);

    this.field = {

      /**
       * @param {Type[]} types
       * @param {Release} release
       */
      base: (types, release) => this.runTests(types, release, "base"),

      /**
       * @param {Type[]} types
       * @param {Release} release
       */
      definition: (types, release) => this.runTests(types, release, "definition"),

      /**
       * @param {Type[]} types
       * @param {Release} release
       */
      name: (types, release) => this.runTests(types, release, "name"),

      /**
       * @param {Type[]} types
       * @param {Release} release
       */
      prefix: (types, release) => this.runTests(types, release, "prefix"),

      /**
       * @param {Type[]} types
       * @param {Release} release
       */
      style: (types, release) => this.runTests(types, release, "style"),

    }

  }

}

module.exports = TypeQA;

let { Release, Type } = require("niem-model");
