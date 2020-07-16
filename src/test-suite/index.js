
const NIEMModelQA = require("..");

/**
 * NIEM Test Suite
 */
class QATestSuite {

  /**
   * @param {NIEMModelQA} qa
   */
  constructor(qa) {

    this.qa = qa;

  }

  get tests() {
    return this.qa._tests;
  }

}

module.exports = QATestSuite;

