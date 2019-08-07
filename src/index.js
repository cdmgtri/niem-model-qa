
let TestSuite = require("niem-test-suite");

let { Test, Issue } = TestSuite;

let TypeQA = require("./type/index");

class NIEMModelQA {

  constructor() {

    this.testSuite = new TestSuite();
    this.testSuite.loggingEnabled = true;

    this.typeQA = new TypeQA(this.testSuite);

  }

  async loadTests() {
    await this.testSuite.loadTests("niem-model-qa-tests.xlsx");
  }

}

NIEMModelQA.Test = Test;
NIEMModelQA.Issue = Issue;

module.exports = NIEMModelQA;
