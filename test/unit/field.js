
let NIEMObjectQA = require("../../src/niem-object/index");
let { NIEMObject } = require("niem-model-objects");
let { Release } = require("niem-model-source").ModelObjects;

class fieldTest {

  /**
   * @param {NIEMObjectQA} objectQA
   * @param {NIEMObject[]} objects
   * @param {Release} release
   * @param {String} fieldName
   */
  constructor(objectQA, objects, release) {
    this.objectQA = objectQA;
    this.objects = objects;
    this.release = release;
    this.fieldTestCount = 0;
  }

  /**
   * @param {String} fieldName
   */
  async run(fieldName) {

    let testSuite = await this.objectQA.field.testSuite(this.objects, this.release, fieldName);

    expect(testSuite.status()).toBe("fail");

    if (fieldName) this.fieldTestCount += testSuite.tests.length;

    return testSuite;
  }

}

module.exports = fieldTest;
