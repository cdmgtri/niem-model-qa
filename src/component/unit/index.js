
let NIEMObjectUnitTests = require("../../niem-object/unit/index");
let { Component } = require("niem-model-objects");

class ComponentUnitTests extends NIEMObjectUnitTests {

  /**
   * Checks that a component name is not repeated in a namespace.
   * @private
   * @param {String} testID
   * @param {Component[]} components
   */
  async name_duplicate__helper(testID, components) {

    /** @type {{String: number}} */
    let counts = {};

    components.forEach( component => {
      let currentCount = counts[component.qname] ? counts[component.qname] : 0;
      counts[component.qname] = currentCount + 1;
    });

    /** @type {Component[]} */
    let problemComponents = [];

    for (let qname in counts) {
      if (counts[qname] > 1) {
        problemComponents.push( ...components.filter( component => component.qname == qname ) );
      }
    }

    return this.testSuite.log(testID, problemComponents, "name");
  }

  /**
   * @private
   * @param {String} testID
   * @param {Component[]} components
   */
  name_invalidChar__helper(testID, components) {
    let regex = /[^A-Za-z0-9_\-.]/;
    let problemComponents = components.filter( component => component.name.match(regex) );
    return this.testSuite.log(testID, problemComponents, "name");
  }

  /**
   * @private
   * @param {String} testID
   * @param {Component[]} components
   */
  name_missing__helper(testID, components) {
    let problemComponents = components.filter( component => ! component.name );
    return this.testSuite.log(testID, problemComponents, "name");
  }

}

module.exports = ComponentUnitTests;
