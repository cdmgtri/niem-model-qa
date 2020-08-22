
let NIEMObjectUnitTests = require("../niem-object/unit");
let { Release, Property } = require("niem-model");
let Test = require("../../test");

/**
 * Property unit tests
 */
class PropertyUnitTests extends NIEMObjectUnitTests {

  /**
   * Check that augmentation element definitions follow a consistent pattern.
   *
   * @example "Definitions 'Additional information about a person' and 'Additional information about nc:PersonType' are valid for em:PersonAugmentation."
   * @example "Definitions 'Additional information about a location' and 'Additional information about nc:OrganizationType' are not valid for em:PersonAugmentation."
   *
   * @param {Property[]} properties
   */
  definition_augmentation(properties) {

    let test = this.qa.tests.start("property_definition_augmentation");

    let augmentations = properties.filter( property => property.name.endsWith("Augmentation") );

    let problemObjects = augmentations
    .filter( property => {
      let baseType = property.groupQName.replace("AugmentationPoint", "Type");
      return property.definition != `Additional information about ${baseType}`
    })
    .filter( property => {
      let nameTerms = property.terms.filter( term => term != "Augmentation" ).join(" ");
      let regex = new RegExp(`Additional information about (?:an? )?${nameTerms}\.?`, "i");
      return ! property.definition.match(regex);
    });

    return this.qa.tests.post(test, problemObjects, "definition", (property) => property.definition);

  }

  /**
   * Check that augmentation point definitions follow a consistent pattern.
   *
   * @example "Definitions 'An augmentation point for PersonType' and a'An augmentation point for nc:PersonType' are valid for nc:PersonAugmentationPoint"
   * @example ""
   *
   * @param {Property[]} properties
   */
  definition_augmentationPoint(properties) {

    let test = this.qa.tests.start("property_definition_augmentationPoint");

    let augmentationPoints = properties.filter( property => property.name.endsWith("AugmentationPoint") );

    let problemObjects = augmentationPoints
    .filter( property => {
      let baseTypeName = property.name.replace("AugmentationPoint", "Type");
      let baseTypeQName = property.prefix + ":" + baseTypeName;
      let regex = new RegExp(`An augmentation point for (?:${baseTypeName})|(?:${baseTypeQName})\.?`);
      return ! property.definition.match(regex);
    });

    return this.qa.tests.post(test, problemObjects, "definition", (property) => property.definition);

  }

  /**
   * Check property definition use consistent formatting.
   *
   * - Two spaces are allowed after a period.  Other uses of multiple consecutive spaces are not allowed.
   * - Leading and trailing spaces are not allowed.
   *
   * @param {Property[]} properties
   * @returns {Promise<Test>}
   */
  definition_formatting(properties) {
    let test = this.qa.tests.start("property_definition_formatting");
    return this.utils.text_formatting_helper(test, properties, "definition");
  }

  /**
   * Check that words in a property definition are either in the dictionary or defined
   * as Local Terminology.
   *
   * @example "Definition 'A FIPS state codes' is valid if the term 'FIPS' is defined as Local Terminology in that namespace."
   *
   * @example "Definition 'A FIPS state codes' is not recommended if the term 'FIPS' is not defined as Local Terminology in that namespace."
   *
   * @param {Property[]} properties
   * @param {Release} release
   * @returns {Promise<Test>}
   */
  async definition_spellcheck(properties, release) {
    let test = this.qa.tests.start("property_definition_spellcheck");
    return this.utils.definition_spellcheck__helper(test, properties, release);
  }

  /**
   * Check that augmentation property names correspond to their augmentation point.
   *
   * @example "Name 'PersonAugmentation' is valid for nc:PersonAugmentationPoint."
   * @example "Name 'ManagerAugmentation' is not valid for nc:PersonAugmentationPoint."
   *
   * @param {Property[]} properties
   */
  async name_augmentation(properties) {

    let test = this.qa.tests.start("property_name_augmentation");

    /** @type {Property[]} */
    let problemObjects = [];

    let augmentations = properties.filter( property => property.groupQName && property.groupName.endsWith("AugmentationPoint") );

    for (let augmentation of augmentations) {
      if (augmentation.name + "Point" != augmentation.groupName) {
        problemObjects.push(augmentation);
      }
    }

    return this.qa.tests.post(test, problemObjects, "name", (property) => 'Does not correspond with ' + property.groupQName);
  }

  /**
   * Check that augmentation property names correspond to their augmentation point elements, with the representation term "AugmentationPoint" replaced by term "Augmentation".
   *
   * @example "'PersonAugmentation' is a valid name for a property that substitutes for augmentation point element 'nc:PersonAugmentationPoint'."
   * @example "'ManagerAugmentation' is not a valid name for a property that substitutes for augmentation point element 'nc:PersonAugmentationPoint'."
   * "
   * @param {Property[]} properties
   */
  async name_repTerm_augmentation(properties) {

    let test = this.qa.tests.start("property_name_repTerm_augmentation");

    let problems = properties
    .filter( property => property.name && property.name.endsWith("Augmentation") )
    .filter( property => !property.groupName || property.groupName.replace(/Point$/, "") != property.name );

    return this.qa.tests.post(test, problems, "name");
  }

  /**
   * Check that an attribute name begins with a lower case letter.
   *
   * @example "Attribute name 'sequenceID' is valid because it begins with a lower case letter."
   * @example "Attribute name 'SequenceID' is not valid because it begins with an upper case letter."
   *
   * @param {Property[]} properties
   * @returns {Promise<Test>}
   */
  async name_camelCase_attribute(properties) {

    let test = this.qa.tests.start("property_name_camelCase_attribute");

    let problems = properties
    .filter( property => property.name && property.isAttribute )
    .filter( property => property.name[0] == property.name[0].toUpperCase() );

    return this.qa.tests.post(test, problems, "name");
  }

  /**
   * Check that an element name begins with an upper case letter.
   *
   * @example "Element name 'Person' is valid because it begins with an upper case letter."
   * @example "Element name 'person' is not valid because it begins with a lower case letter."
   *
   * @param {Property[]} properties
   * @returns {Promise<Test>}
   */
  async name_camelCase_element(properties) {

    let test = this.qa.tests.start("property_name_camelCase_element");

    let problems = properties
    .filter( property => property.name && property.isElement )
    .filter( property => property.name[0] == property.name[0].toLowerCase() );

    return this.qa.tests.post(test, problems, "name");
  }

  /**
   * Check that property names are not repeated in a namespace.
   *
   * @example "Elements 'hs:PersonAugmentation' and 'im:PersonAugmentation' are valid even though they have the same name because they are defined in different namespaces."
   * @example "Element 'PersonAugmentation' cannot be defined twice in the Human Services namespace."
   *
   * @param {Property[]} properties
   * @returns {Promise<Test>}
   */
  async name_duplicate(properties) {
    let test = this.qa.tests.start("property_name_duplicate");
    return this.utils.name_duplicate__helper(test, properties);
  }

  /**
   * Check that all property names use valid characters.
   *
   * @example "Property name 'Person' uses valid characters."
   * @example "Property name 'PersonIsCitizen?' does not use valid characters."
   *
   * @param {Property[]} properties
   * @returns {Promise<Test>}
   */
  async name_invalidChar(properties) {
    let test = this.qa.tests.start("property_name_invalidChar");
    return this.utils.name_invalidChar__helper(test, properties);
  }

  /**
   * Check that all properties have names.
   * @param {Property[]} properties
   * @returns {Promise<Test>}
   */
  async name_missing(properties) {
    let test = this.qa.tests.start("property_name_missing");
    return this.utils.name_missing__helper(test, properties);
  }

  /**
   * Check that property name terms are either in the dictionary or defined in
   * Local Terminology.
   *
   * @example "Property name 'nc:StateFIPSCode' is valid if the nc namespace defines the meaning of 'FIPS' in its Local Terminology section."
   *
   * @example "Property name 'nc:StateFIPSCode' is not valid if the nc namespace does not define 'FIPS' in its Local Terminology section."
   *
   * @param {Property[]} properties
   * @param {Release} release
   * @returns {Promise<Test>}
   */
  async name_spellcheck(properties, release) {
    let test = this.qa.tests.start("property_name_spellcheck");
    return this.utils.name_spellcheck__helper(test, properties, release);
  }

  /**
   * Check that properties have a namespace prefix.
   * @param {Property[]} properties
   * @returns {Promise<Test>}
   */
  async prefix_missing(properties) {
    let test = this.qa.tests.start("property_prefix_missing");
    let problems = properties.filter( property => ! property.prefix );
    return this.qa.tests.post(test, problems, "prefix");
  }

  /**
   * Check that properties have a namespace prefix that has been defined in the release.
   * @param {Property[]} properties
   * @param {Release} release
   * @returns {Promise<Test>}
   */
  async prefix_unknown(properties, release) {
    let test = this.qa.tests.start("property_prefix_unknown");
    return this.utils.prefix_unknown__helper(test, properties, release);
  }

}

module.exports = PropertyUnitTests;
