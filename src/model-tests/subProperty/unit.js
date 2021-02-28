
let NIEMObjectUnitTests = require("../niem-object/unit");
let { Release, SubPropertyInstance } = require("niem-model");

class NamespaceUnitTests extends NIEMObjectUnitTests {

  /**
   * @param {SubPropertyInstance[]} subProperties
   */
  async propertyQName_representation(subProperties) {
    let test = this.qa.tests.start("subProperty_propertyQName_representation");

    let problems = subProperties
    .filter( subProperty => subProperty.propertyQName.endsWith("Representation") )
    .filter( subProperty => subProperty.propertyQName != subProperty.typeQName.replace(/Type$/, "Representation") );

    return this.qa.tests.post(test, problems, "propertyQName", (subProperty) => subProperty.typeQName);
  }

}

module.exports = NamespaceUnitTests;
