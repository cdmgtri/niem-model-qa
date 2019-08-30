
let NIEMObjectQA = require("../niem-object");
let PropertyUnitTests = require("./unit");

class PropertyQA extends NIEMObjectQA {

  constructor(testSuite) {

    super(testSuite);

    this.test = new PropertyUnitTests(testSuite);

    /**
     * @param {Property[]} properties
     * @param {Release} release
     * @returns {QATestSuite}
     */
    this.all = (properties, release) => this.runTests(properties, release);

    this.field = {

      /**
       * @param {Property[]} properties
       * @param {Release} release
       * @returns {QATestSuite}
       */
      definition: (properties, release) => this.runTests(properties, release, "definition"),

      /**
       * @param {Property[]} properties
       * @param {Release} release
       * @returns {QATestSuite}
       */
      name: (properties, release) => this.runTests(properties, release, "name"),

      /**
       * @param {Property[]} properties
       * @param {Release} release
       * @returns {QATestSuite}
       */
      prefix: (properties, release) => this.runTests(properties, release, "prefix"),

    };

  }

}

module.exports = PropertyQA;

let { Release, Property } = require("niem-model");
let QATestSuite = require("../test-suite");
