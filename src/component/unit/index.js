
let NIEMObjectUnitTests = require("../../niem-object/unit/index");
let { Component } = require("niem-model-objects");

class ComponentUnitTests extends NIEMObjectUnitTests {

  /**
   * @private
   * @param {Component[]} components
   * @param {String} testID
   */
  name_missing__helper(components, testID) {
    let problemComponents = components.filter( component => ! component.name );
    return this.testSuite.log(testID, problemComponents, "name");
  }

  /**
   * @private
   * @param {Component[]} components
   * @param {String} testID
   */
  name_invalidChar__helper(components, testID) {
    let regex = /[^A-Za-z0-9_\-.]/;
    let problemComponents = components.filter( component => component.name.match(regex) );
    return this.testSuite.log(testID, problemComponents, "name");
  }

}

module.exports = ComponentUnitTests;
