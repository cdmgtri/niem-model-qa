
let NIEMObjectTester = require("../niem-object");
let PropertyUnitTests = require("./unit");

class PropertyTester extends NIEMObjectTester {

  constructor(qa) {

    super(qa);

    this.test = new PropertyUnitTests(qa);

    /**
     * @param {Property[]} properties
     * @param {Release} release
     * @returns {Promise<NIEMModelQA>}
     */
    this.run = (properties, release) => this.runTests(properties, release);

    this.field = {

      /**
       * @param {Property[]} properties
       * @param {Release} release
       * @returns {Promise<NIEMModelQA>}
       */
      definition: (properties, release) => this.runTests(properties, release, "definition"),

      /**
       * @param {Property[]} properties
       * @param {Release} release
       * @returns {Promise<NIEMModelQA>}
       */
      name: (properties, release) => this.runTests(properties, release, "name"),

      /**
       * @param {Property[]} properties
       * @param {Release} release
       * @returns {Promise<NIEMModelQA>}
       */
      prefix: (properties, release) => this.runTests(properties, release, "prefix"),

    };

  }

}

module.exports = PropertyTester;

let NIEMModelQA = require("../../index");
let { Release, Property } = require("niem-model");
