
let NIEMObjectQA = require("../niem-object/index");
let PropertyUnitTests = require("./unit");

class PropertyQA extends NIEMObjectQA {

  constructor(testSuite) {

    super(testSuite);

    this.test = new PropertyUnitTests(testSuite);

    this.all = this.loadTests();

    this.field = {

      definition: this.loadTests("definition"),

      name: this.loadTests("name"),

      prefix: this.loadTests("prefix"),

    };

  }

  /**
   * @private
   * @param {string} field
   */
  loadTests(field) {

    /**
     * @param {Property[]} properties
     * @param {Release} release
     */
    let fn = (properties, release) => this.runTests(properties, release, field);
    return fn;
  }

}

module.exports = PropertyQA;

let { Release, Property } = require("niem-model");
