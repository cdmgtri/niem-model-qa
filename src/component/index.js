
let NIEMObjectQA = require("../niem-object/index");

let { Test, Issue } = NIEMObjectQA;

let { Component } = require("niem-model-objects");

class ComponentQA extends NIEMObjectQA {

  constructor(testSuite) {
    super(testSuite)
  }

}


module.exports = ComponentQA;
