
let NIEMObjectQA = require("../../src/model-tests/niem-object/index");
let { ReleaseDef, NIEMObjectDef } = require("niem-model").TypeDefs;

class fieldTest {

  /**
   * @param {NIEMObjectQA} objectQA
   * @param {NIEMObjectDef[]} objects
   * @param {ReleaseDef} release
   */
  constructor(objectQA, objects, release) {
    this.objectQA = objectQA;
    this.objects = objects;
    this.release = release;
    this.fieldTestCount = 0;

    objects.forEach( object => object.release = release );
  }

  /**
   * @param {string} fieldName
   */
  async run(fieldName) {

    let qa = await this.objectQA.field[fieldName](this.objects, this.release);

    expect(qa.results.status()).toBe("fail");

    if (fieldName) this.fieldTestCount += qa.tests.length;

    return qa;
  }

}

module.exports = fieldTest;
