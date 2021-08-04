
let NIEMObjectTester = require("../niem-object");
let PropertyUnitTests = require("./unit");

class PropertyTester extends NIEMObjectTester {

  constructor(qa) {

    super(qa);

    this.tests = new PropertyUnitTests(qa);

    /**
     * @param {PropertyDef[]} properties
     * @param {ReleaseDef} release
     * @returns {Promise<NIEMModelQA>}
     */
    this.run = (properties, release) => this.runTests(properties, release);

    this.field = {

      /**
       * @param {PropertyDef[]} properties
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      definition: (properties, release) => this.runTests(properties, release, "definition"),

      /**
       * @param {PropertyDef[]} properties
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      name: (properties, release) => this.runTests(properties, release, "name"),

      /**
       * @param {PropertyDef[]} properties
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      prefix: (properties, release) => this.runTests(properties, release, "prefix"),

      /**
       * @param {PropertyDef[]} properties
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      type: (properties, release) => this.runTests(properties, release, "type"),

      /**
       * @param {PropertyDef[]} properties
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      general: (properties, release) => this.runTests(properties, release, "general"),

    };

  }

}

module.exports = PropertyTester;

let NIEMModelQA = require("../../index");
let { ReleaseDef, PropertyDef } = require("niem-model").TypeDefs;
