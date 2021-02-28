
let NIEMObjectTester = require("../niem-object/index");
let SubPropertyUnitTests = require("./unit");
let { ReleaseInstance, SubPropertyInstance } = require("niem-model");

class SubPropertyTester extends NIEMObjectTester {

  constructor(qa) {

    super(qa);

    this.tests = new SubPropertyUnitTests(qa);

    /**
     * @param {SubPropertyInstance[]} subProperties
     * @param {ReleaseInstance} release
     * @return {Promise<NIEMModelQA>}
     */
    this.run = (subProperties, release) => this.runTests(subProperties, release);

    this.field = {

      /**
       * @param {SubPropertyInstance[]} subProperties
       * @param {ReleaseInstance} release
       * @returns {Promise<NIEMModelQA>}
       */
      propertyQName: (subProperties, release) => this.runTests(subProperties, release, "propertyQName")

    }

  }

}

const NIEMModelQA = require("../../index");

module.exports = SubPropertyTester;
