
module.exports = {
  NIEMModelQA: require("./src/index"),
  Issue: require("./src/issue"),
  Test: require("./src/test"),

  NIEMObjectTester: require("./src/model-tests/niem-object/index"),
  NamespaceTester: require("./src/model-tests/namespace/index"),
  PropertyTester: require("./src/model-tests/property/index"),
  TypeTester: require("./src/model-tests/type/index"),
  FacetTester: require("./src/model-tests/facet/index"),

  NIEMObjectUnitTests: require("./src/model-tests/niem-object/unit"),
  NamespaceUnitTests: require("./src/model-tests/namespace/unit"),
  PropertyUnitTests: require("./src/model-tests/property/unit"),
  TypeUnitTests: require("./src/model-tests/type/unit"),
  FacetUnitTests: require("./src/model-tests/facet/unit"),

}
