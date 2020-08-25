
let NIEMObjectTester = require("../niem-object/index");
let SubPropertyUnitTests = require("./unit");
let { Release, SubProperty } = require("niem-model");

class SubPropertyTester extends NIEMObjectTester {

  constructor(qa) {

    super(qa);

    this.tests = new SubPropertyUnitTests(qa);

    /**
     * @param {SubProperty[]} subProperties
     * @param {Release} release
     * @return {Promise<NIEMModelQA>}
     */
    this.run = (subProperties, release) => this.runTests(subProperties, release);

    this.field = {

      /**
       * @param {SubProperty[]} subProperties
       * @param {Release} release
       * @returns {Promise<NIEMModelQA>}
       */
      propertyQName: (subProperties, release) => this.runTests(subProperties, release, "propertyQName")

    }

  }

}

const NIEMModelQA = require("../../index");

module.exports = SubPropertyTester;
