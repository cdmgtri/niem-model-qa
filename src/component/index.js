
let NIEMObjectQA = require("../niem-object/index");

let { Test, Issue } = NIEMObjectQA;

let { Component } = require("niem-model-objects");

class ComponentQA extends NIEMObjectQA {

  constructor(testSuite) {
    super(testSuite)
  }

  /**
   * @param {Component[]} components
   * @param {String} testID
   */
  checkNames_missing(components, testID) {
    let problemComponents = components.filter( component => ! component.name );
    return this.logIssues(testID, problemComponents, "name");
  }

  /**
   * @param {Component[]} components
   * @param {String} testID
   */
  checkNames_invalidChar(components, testID) {
    let regex = /[^A-Za-z0-9_\-.]/;
    let problemComponents = components.filter( component => component.name.match(regex) );
    return this.logIssues(testID, problemComponents, "name");
  }

}

module.exports = ComponentQA;
