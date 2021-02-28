
let NIEMObjectTester = require("../niem-object");
let PropertyUnitTests = require("./unit");

class PropertyTester extends NIEMObjectTester {

  constructor(qa) {

    super(qa);

    this.tests = new PropertyUnitTests(qa);

    /**
     * @param {PropertyInstance[]} properties
     * @param {ReleaseInstance} release
     * @returns {Promise<NIEMModelQA>}
     */
    this.run = (properties, release) => this.runTests(properties, release);

    this.field = {

      /**
       * @param {PropertyInstance[]} properties
       * @param {ReleaseInstance} release
       * @returns {Promise<NIEMModelQA>}
       */
      definition: (properties, release) => this.runTests(properties, release, "definition"),

      /**
       * @param {PropertyInstance[]} properties
       * @param {ReleaseInstance} release
       * @returns {Promise<NIEMModelQA>}
       */
      name: (properties, release) => this.runTests(properties, release, "name"),

      /**
       * @param {PropertyInstance[]} properties
       * @param {ReleaseInstance} release
       * @returns {Promise<NIEMModelQA>}
       */
      prefix: (properties, release) => this.runTests(properties, release, "prefix"),

    };

  }

}

module.exports = PropertyTester;

let NIEMModelQA = require("../../index");
let { ReleaseInstance, PropertyInstance } = require("niem-model");
