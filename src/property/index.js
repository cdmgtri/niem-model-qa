
let NIEMTestSuite = require("niem-test-suite");
let NIEMObjectQA = require("../niem-object");
let PropertyUnitTests = require("./unit");
let Utils = require("../utils/index");

class PropertyQA extends NIEMObjectQA {

  constructor(testSuite, utils) {

    super(testSuite);

    this.test = new PropertyUnitTests(testSuite, utils);

    /**
     * @param {Property[]} properties
     * @param {Release} release
     * @returns {Promise<NIEMTestSuite>}
     */
    this.all = (properties, release) => this.runTests(properties, release);

    this.field = {

      /**
       * @param {Property[]} properties
       * @param {Release} release
       * @returns {Promise<NIEMTestSuite>}
       */
      definition: (properties, release) => this.runTests(properties, release, "definition"),

      /**
       * @param {Property[]} properties
       * @param {Release} release
       * @returns {Promise<NIEMTestSuite>}
       */
      name: (properties, release) => this.runTests(properties, release, "name"),

      /**
       * @param {Property[]} properties
       * @param {Release} release
       * @returns {Promise<NIEMTestSuite>}
       */
      prefix: (properties, release) => this.runTests(properties, release, "prefix"),

    };

  }

}

module.exports = PropertyQA;

let { Release, Property } = require("niem-model");
