
let Utils = require("../../utils");

/**
 * @private
 */
class NIEMObjectUnitTests {

  /**
   * @param {NIEMModelQA} qa
   * @param {Utils} utils
   */
  constructor(qa, utils) {
    this.qa = qa;

    /** @private */
    this.utils = utils;
  }

}

let NIEMModelQA = require("../../index");

module.exports = NIEMObjectUnitTests;
