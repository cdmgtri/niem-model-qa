
let NIEMObjectTester = require("../niem-object/index");
let SubPropertyUnitTests = require("./unit");
let { ReleaseDef, SubPropertyDef } = require("niem-model").TypeDefs;

class SubPropertyTester extends NIEMObjectTester {

  constructor(qa) {

    super(qa);

    this.tests = new SubPropertyUnitTests(qa);

    /**
     * @param {SubPropertyDef[]} subProperties
     * @param {ReleaseDef} release
     * @return {Promise<NIEMModelQA>}
     */
    this.run = (subProperties, release) => this.runTests(subProperties, release);

    this.field = {

      /**
       * @param {SubPropertyDef[]} subProperties
       * @param {ReleaseDef} release
       * @returns {Promise<NIEMModelQA>}
       */
      propertyQName: (subProperties, release) => this.runTests(subProperties, release, "propertyQName")

    }

  }

}

const NIEMModelQA = require("../../index");

module.exports = SubPropertyTester;
