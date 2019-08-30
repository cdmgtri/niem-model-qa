
let NIEMObjectQA = require("../niem-object");
let TypeUnitTests = require("./unit");

class TypeQA extends NIEMObjectQA {

  constructor(testSuite) {

    super(testSuite);

    this.test = new TypeUnitTests(testSuite);

    this.all = this.loadTests();

    this.field = {

      base: this.loadTests("base"),

      definition: this.loadTests("definition"),

      name: this.loadTests("name"),

      prefix: this.loadTests("prefix"),

      style: this.loadTests("style")

    }

  }

  /**
   * @private
   * @param {string} field
   */
  loadTests(field) {

    /**
     * @param {Type[]} types
     * @param {Release} release
     */
    let fn = (types, release) => this.runTests(types, release, field);
    return fn;
  }

}

module.exports = TypeQA;

let { Release, Type } = require("niem-model");
