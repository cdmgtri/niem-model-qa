
/**
 * @private
 */
class NIEMObjectUnitTests {

  /**
   * @param {NIEMModelQA} qa
   */
  constructor(qa) {
    this.qa = qa;

    this.utils = qa.utils;
  }

}

let NIEMModelQA = require("../../index");

module.exports = NIEMObjectUnitTests;
