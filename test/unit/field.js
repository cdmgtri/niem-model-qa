
let NIEMObjectQA = require("../../src/model-tests/niem-object/index");
let { Release, NIEMObject } = require("niem-model");

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

    objects.forEach( object => object.release = release );
  }

  /**
   * @param {String} fieldName
   */
  async run(fieldName) {

    let testSuite = await this.objectQA.field[fieldName](this.objects, this.release);

    expect(testSuite.qa.results.status()).toBe("fail");

    if (fieldName) this.fieldTestCount += testSuite.qa.tests.length;

    return testSuite;
  }

}

module.exports = fieldTest;
