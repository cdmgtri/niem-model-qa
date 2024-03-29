
let { Type, TypeDefs } = require("niem-model");
let { ReleaseDef, TypeDef } = TypeDefs;
let NIEMObjectUnitTests = require("../niem-object/unit");
let Test = require("../../test");

/**
 * Type unit tests
 */
class TypeUnitTests extends NIEMObjectUnitTests {

  /**
   * Checks that association types extend a type that ends in "AssociationType"
   * @param {TypeDef[]} types
   */
  async base_association(types) {
    let test = this.qa.tests.start("type_base_association");
    let problems = types
    .filter( type => type.style == "association" && type.prefix != "structures")
    .filter( type => !type.baseQName || !type.baseQName.endsWith("AssociationType") );
    return this.qa.tests.post(test, problems, "baseQName", (type) => type.baseQName);
  }

  /**
   * Checks that augmentation types extend structures:AugmentationType
   * @param {TypeDef[]} types
   */
  async base_augmentation(types) {
    let test = this.qa.tests.start("type_base_augmentation");
    let problems = types.filter( type => type.style == "augmentation" && type.baseQName != "structures:AugmentationType");
    return this.qa.tests.post(test, problems, "baseQName", (type) => type.baseQName);
  }

  /**
   * Check that complex types with simple content (CSC) have a CSC or a simple
   * base type.
   *
   * @example "Simple content type HairColorCodeType can have base type HairColorCodeSimpleType (simple type)."
   * @example "Simple content type HairColorCodeType cannot have base type nc:PersonType (complex object type)."
   *
   * @param {TypeDef[]} types
   * @param {ReleaseDef} release
   * @returns {Promise<Test>}
   */
  async base_csc(types, release) {

    let test = this.qa.tests.start("type_base_csc");

    /** @type {TypeDef[]} */
    let problemTypes = [];

    let cscTypes = types.filter( type => type.style == "CSC" && type.baseQName );

    for (let cscType of cscTypes) {
      let baseType = await release.types.get( cscType.baseQName );

      if (baseType && baseType.isComplexContent) {
        problemTypes.push(cscType);
      }
    }

    return this.qa.tests.post(test, problemTypes, "baseQName", (type) => type.baseQName);
  }

  /**
   * Checks that metadata types extend structures:MetadataType
   * @param {TypeDef[]} types
   */
  async base_metadata(types) {
    let test = this.qa.tests.start("type_base_metadata");
    let problems = types.filter( type => type.style == "metadata" && type.baseQName != "structures:MetadataType");
    return this.qa.tests.post(test, problems, "baseQName", (type) => type.baseQName);
  }

  /**
   * Check that object types that contain RoleOf elements extend structures:ObjectType
   *
   * @example "Type j:VictimType can contain nc:RoleOfPerson and extend structures:ObjectType"
   * @example "Type j:VictimType should not both contain nc:RoleOfPerson and extend nc:PersonType"
   *
   * @param {TypeDef[]} types
   * @param {ReleaseDef} release
   */
  async base_role(types, release) {

    let test = this.qa.tests.start("type_base_role");

    /** @type {TypeDef[]} */
    let problemTypes = [];

    let roleProperties = await release.properties.find({groupQName: "nc:RoleOfAbstract"});
    let rolePropertyQNames = roleProperties.map( property => property.qname );

    // Find subProperties for RoleOf elements
    let subProperties = await release.subProperties.find({keyword: "RoleOf"});
    subProperties = subProperties.filter( subProperty => rolePropertyQNames.includes(subProperty.propertyQName) );

    // Get unique list of role type names
    let typeQNameSet = new Set(subProperties.map( subProperty => subProperty.typeQName) );

    // Check the parent of each role type
    for (let typeQName of typeQNameSet) {
      let type = types.find( type => type.qname == typeQName );
      if (type.baseQName != "structures:ObjectType") {
        problemTypes.push(type);
      }
    }

    /**
     * @param {TypeDef} type
     */
    let commentFunction = (type) => {
      let roles = subProperties
      .filter( subProperty => subProperty.typeQName == type.qname )
      .map( subProperty => subProperty.propertyQName )
      .join(", ");
      return `extends ${type.baseQName} and contains ${roles}`;
    }

    return this.qa.tests.post(test, problemTypes, "baseQName", commentFunction);

  }

  /**
   * Check that simple types have a XML schema base type.
   *
   * @example "Simple type ext:HairColorCodeSimpleType can have base type xs:token."
   * @example "Simple type ext:HairColorCodeSimpleType should not have base type ext:ColorCodeSimpleType."
   *
   * @param {TypeDef[]} types
   * @param {ReleaseDef} release
   * @returns {Promise<Test>}
   */
  async base_simple(types, release) {

    let test = this.qa.tests.start("type_base_simple");

    /** @type {TypeDef[]} */
    let problemTypes = [];

    let simpleTypes = types.filter( type => type.style == "simple" && type.baseQName );

    for (let simpleType of simpleTypes) {
      let baseType = await release.types.get( simpleType.baseQName );

      if (baseType && baseType.prefix != "xs") {
        problemTypes.push(simpleType);
      }
    }

    return this.qa.tests.post(test, problemTypes, "baseQName");
  }

  /**
   * Check that simple content types have a base.
   * Exception: Simple union types have member types instead of a base.
   *
   * @example "Type HairColorCodeSimpleType needs a base type like xs:string or xs:token."
   * @example "Type HairColorCodeSimpleType is not valid without a base type."
   *
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async base_simpleContent(types) {
    let test = this.qa.tests.start("type_base_simpleContent");
    let problemTypes = types.filter( type => {
      return type.isSimpleContent && type.style != "union" && ! type.baseQName;
    });
    return this.qa.tests.post(test, problemTypes, "baseQName");
  }

  /**
   * Checks that union types do not have a base type
   * @param {TypeDef[]} types
   */
  async base_union(types) {
    let test = this.qa.tests.start("type_base_union");
    let problems = types.filter( type => type.style == "union" && type.baseQName );
    return this.qa.tests.post(test, problems, "baseQName", (type) => type.baseQName);
  }

  /**
   * Check that type bases exist.
   *
   * @example "Type PersonType can extend type structures:ObjectType (this type exists)."
   * @example "Type PersonType cannot extend type structures:BogusType (this type does not exist)."
   *
   * @param {TypeDef[]} types
   * @param {ReleaseDef} release
   * @returns {Promise<Test>}
   */
  async base_unknown(types, release) {

    let test = this.qa.tests.start("type_base_unknown");

    /** @type {TypeDef[]} */
    let problemTypes = [];

    // Get all types that have a base type
    let basedTypes = types.filter( type => type.baseQName );

    for (let basedType of basedTypes) {
      let type = await release.types.get( basedType.qname );
      if (! type) {
        problemTypes.push(basedType);
      }
    }

    return this.qa.tests.post(test, problemTypes, "baseQName");
  }

  /**
   * Check that augmentation type definitions follow a consistent pattern.
   *
   * @example "Definitions 'A data type for additional information about a person' and 'A data type for additional information about nc:PersonType' are valid for em:PersonAugmentationType."
   * @example "Definitions 'A data type for additional information about a location' and 'A data type for additional information about nc:OrganizationType' are not valid for em:PersonAugmentationType."
   *
   * @param {TypeDef[]} types
   */
  definition_augmentation(types) {

    let test = this.qa.tests.start("type_definition_augmentation");

    let augmentations = types.filter( type => type.name.endsWith("AugmentationType") );

    let problemObjects = augmentations.filter( type => {
      let nameTerms = type.terms.filter( term => term != "Augmentation" && term != "Type" ).join(" ");
      let regex = new RegExp(`A data type for additional information about (?:an? )?${nameTerms}\.?`, "i");
      return ! type.definition.match(regex);
    });

    return this.qa.tests.post(test, problemObjects, "definition", (type) => type.definition);

  }

  /**
   * Check type definition use consistent formatting.
   *
   * - Two spaces are allowed after a period.  Other uses of multiple consecutive spaces are not allowed.
   * - Leading and trailing spaces are not allowed.
   *
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  definition_formatting(types) {
    let test = this.qa.tests.start("type_definition_formatting");
    return this.utils.text_formatting_helper(test, types, "definition");
  }

  /**
   * Check that a complex type has a definition.
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async definition_missing_complex(types) {
    let test = this.qa.tests.start("type_definition_missing_complex");
    let problemTypes = types.filter( type => type.isComplexType && ! type.definition )
    return this.qa.tests.post(test, problemTypes, "definition");
  }

  /**
   * Check that a simple type has a definition.
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async definition_missing_simple(types) {
    let test = this.qa.tests.start("type_definition_missing_simple");
    let problemTypes = types.filter( type => type.isSimpleType && ! type.definition )
    return this.qa.tests.post(test, problemTypes, "definition");
  }

  /**
   * Check that a complex type definition begins with the opening phrase 'A data type '.
   *
   * @example "Definition 'A data type for a human being' is valid for type 'PersonType'."
   * @example "Definition 'A human being' is not valid for type 'PersonType'."
   *
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async definition_phrase_complex(types) {

    let test = this.qa.tests.start("type_definition_phrase_complex");

    let problemTypes = types
    .filter( type => type.isComplexType && type.definition )
    .filter( type => ! type.definition.startsWith("A data type ") );

    return this.qa.tests.post(test, problemTypes, "definition");
  }

  /**
   * Check that a simple type definition begins with the opening phrase 'A data type '.
   *
   * @example "Definition 'A data type for United States state codes' is valid for type usps:StateCodeSimpleType."
   *
   * @example "Definition 'United States state codes' is not valid for type usps:StateCodeSimpleType."
   *
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async definition_phrase_simple(types) {

    let test = this.qa.tests.start("type_definition_phrase_simple");

    let problemTypes = types
    .filter( type => type.isSimpleType && type.definition )
    .filter( type => ! type.definition.startsWith("A data type ") );

    return this.qa.tests.post(test, problemTypes, "definition");
  }

  /**
   * Check that words in a type definition are either in the dictionary or defined
   * as Local Terminology.
   *
   * @example "Definition 'A data type for FIPS state codes' is valid if the term 'FIPS' is defined as Local Terminology in that namespace."
   *
   * @example "Definition 'A data type for FIPS state codes' is not recommended if the term 'FIPS' is not defined as Local Terminology in that namespace."
   *
   * @param {TypeDef[]} types
   * @param {ReleaseDef} release
   * @returns {Promise<Test>}
   */
  async definition_spellcheck(types, release) {
    let test = this.qa.tests.start("type_definition_spellcheck");
    return this.utils.definition_spellcheck__helper(test, types, release);
  }

  /**
   * Check for types that do not have a data property, are not extended, do not serve as a base type,
   * and are not union types.
   *
   * @param {TypeDef[]} types
   * @param {ReleaseDef} release
   */
  async general_unused(types, release) {

    let test = this.qa.tests.start("type_general_unused");

    let subProperties = await release.subProperties.find();

    let problems = types.filter( type => {
      return ! subProperties.some( subProperty => subProperty.typeQName == type.qname )
      && !type.baseQName
      && type.memberQNames.length == 0 ;
    });

    return this.qa.tests.post(test, problems, "");

  }

  /**
   * Check that a type name begins with an upper case letter.
   *
   * NDR exceptions:
   * - XML schema types (xs:string)
   * - Proxy XML schema types (niem-xs:string)
   *
   * @example "Type name 'PersonType' is valid because it begins with an upper case letter."
   *
   * @example "Type name 'personType' is not valid because it begins with a lower case letter."

   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async name_camelCase(types) {

    let test = this.qa.tests.start("type_name_camelCase");

    let problemTypes = types
    .filter( type => type.name )
    .filter( type => type.prefix != "xs" && type.prefix != "niem-xs" )
    .filter( type => type.name[0] == type.name[0].toLowerCase() );

    return this.qa.tests.post(test, problemTypes, "name");
  }

  /**
   * Check that type names are not repeated in a namespace.
   *
   * @example "Types 'justice:CaseType' and 'logistics:CaseType' are valid because even though they use the same name, they are defined in different namespaces."
   * @example "Type name 'CaseType' cannot be defined twice in the justice namespace."
   *
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async name_duplicate(types) {
    let test = this.qa.tests.start("type_name_duplicate");
    return this.utils.name_duplicate__helper(test, types, "qname");
  }

  /**
   * Check for type names that are repeated in a release.
   * Ignores augmentations and codes because those are expected to have some overlaps.
   *
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async name_overlap(types) {
    let test = this.qa.tests.start("type_name_overlap");
    return this.utils.name_duplicate__helper(test, types, "name");
  }

  /**
   * Check that a type using representation term "CodeType" follows the same
   * naming pattern as its simple base type.
   *
   * @example "Type name 'HairColorCodeType' is valid with base type 'HairColorCodeSimpleType'."
   *
   * @example "Type name 'HairColorCodeType' is not recommended with base type 'EyeColorCodeSimpleType'."
   *
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async name_inconsistent_codeType(types) {

    let test = this.qa.tests.start("type_name_inconsistent_codeType");

    let problemTypes = types
    .filter( type => type.name && type.name.endsWith("CodeType") && type.baseName )
    .filter( type => type.name.replace("CodeType", "CodeSimpleType") != type.baseName );

    return this.qa.tests.post(test, problemTypes, "name", (type) => "base type " + type.baseQName);
  }

  /**
   * Check that all type names use valid characters.
   *
   * @example "Type name 'PersonType' uses valid characters."
   * @example "Type name 'ID#Type' does not use valid characters."
   *
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async name_invalidChar(types) {
    let test = this.qa.tests.start("type_name_invalidChar");
    return this.utils.name_invalidChar__helper(test, types);
  }

  /**
   * Check that all complex types have names.
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async name_missing_complex(types) {
    let test = this.qa.tests.start("type_name_missing_complex");
    let complexTypes = types.filter( type => type.isComplexType );
    return this.utils.name_missing__helper(test, complexTypes);
  }

  /**
   * Check that all simple types have names.
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async name_missing_simple(types) {
    let test = this.qa.tests.start("type_name_missing_simple");
    let simpleTypes = types.filter( type => type.isSimpleType );
    return this.utils.name_missing__helper(test, simpleTypes);
  }

  /**
   * Check that a type with representation term "CodeSimpleType" declares codes.
   *
   * @example "Type name 'WeekdayCodeSimpleType' is valid if the type declares codes."
   *
   * @example "Type name 'WeekdayCodeSimpleType' is not valid if the type does not declare codes."
   *
   * @param {TypeDef[]} types
   * @param {ReleaseDef} release
   * @returns {Promise<Test>}
   */
  async name_repTerm_codeSimpleType(types, release) {

    let test = this.qa.tests.start("type_name_repTerm_codeSimpleType");

    let codeSimpleTypes = types.filter( type => type.name && type.name.endsWith("CodeSimpleType"));

    /** @type {TypeDef[]} */
    let problemTypes = [];

    for (let type of codeSimpleTypes) {

      // No facets getter on the type - return un-ran test
      if (!type.facets) return test;

      if (type.style == "union") {
        // Check that a union CodeSimpleType has at least one member CodeSimpleType
        if (!type.memberQNames.some( memberQName => memberQName.endsWith("CodeSimpleType") )) {
          problemTypes.push(type);
        }
      }
      else {
        let facets = await release.facets.find({typeQName: type.qname});
        if (facets.length == 0) {
          // The CodeSimpleType did not have any facets
          problemTypes.push(type);
        }
      }
    }

    return this.qa.tests.post(test, problemTypes, "name");
  }

  /**
   * Check that a type using representation term "CodeType" has a base type
   * with representation term "CodeSimpleType".
   *
   * @example "Type name 'WeekdayCodeSimpleType' is not valid if the type does not declare codes."
   *
   * @example "Type name 'WeekdayCodeType' is not valid with base type 'string'"
   *
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async name_repTerm_codeType(types) {

    let test = this.qa.tests.start("type_name_repTerm_codeType");

    let problemTypes = types
    .filter( type => type.isComplexType && type.name && type.name.endsWith("CodeType") )
    .filter( type => ! type.baseQName || ! type.baseQName.endsWith("CodeSimpleType") );

    return this.qa.tests.post(test, problemTypes, "name");
  }

  /**
   * Check that complex type names do not end with "SimpleType"
   *
   * @example "Type name 'IDSimpleType' is valid if the type is simple."
   * @example "Type name 'IDSimpleType' is not valid if the type is complex."
   *
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async name_repTerm_complex(types) {

    let test = this.qa.tests.start("type_name_repTerm_complex");

    let problemTypes = types
    .filter( type => type.isComplexType && type.name )
    .filter( type => type.name.endsWith("SimpleType") );

    return this.qa.tests.post(test, problemTypes, "name");
  }

  /**
   * Check that simple type names end with "SimpleType"
   *
   * NDR exceptions: XML schema types (xs:string)
   *
   * @example "Type name 'IDSimpleType' is valid if the type is simple."
   * @example "Type name 'IDType' is not valid if the type is simple."
   *
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async name_repTerm_simple(types) {

    let test = this.qa.tests.start("type_name_repTerm_simple");

    let problemTypes = types
    .filter( type => type.prefix != "xs" && type.isSimpleType && type.name )
    .filter( type => ! type.name.endsWith("SimpleType") );

    return this.qa.tests.post(test, problemTypes, "name");
  }

  /**
   * Check that all type names end with the term "Type"
   *
   * NDR exceptions:
   * - XML schema types (xs:string)
   * - Proxy XML schema types (niem-xs:string)
   *
   * @example "Type name 'PersonType' is valid."
   * @example "Type name 'Person' is not valid."
   *
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async name_repTerm_type(types) {

    let test = this.qa.tests.start("type_name_repTerm_type");

    let problemTypes = types
    .filter( type => type.prefix != "xs" && type.prefix != "niem-xs" && type.name )
    .filter( type => ! type.name.endsWith("Type") );

    return this.qa.tests.post(test, problemTypes, "name");
  }

  /**
   * Check that all type names do not use the term "Type" other than as the
   * final representation term.
   *
   * @example "Type name 'IDCategoryCodeType' is valid because the term 'Type' only appears at the end of the name."
   *
   * @example "Type name 'IDTypeCodeType' is not valid because the term 'Type' is used in the middle of the name."
   *
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async name_reservedTerm_type(types) {
    let test = this.qa.tests.start("type_name_reservedTerm_type");
    let problemTypes = types.filter( type => type.name.match(/Type.*Type/) );
    return this.qa.tests.post(test, problemTypes, "name");
  }

  /**
   * Check that type name terms are either in the dictionary or defined in
   * Local Terminology.
   *
   * @example "Type name 'ncic:VMOCodeType' is valid if the ncic namespace defines the meaning of 'VMO' in its Local Terminology section."
   *
   * @example "Type name 'ncic:VMOCodeType' is not valid if the ncic namespace does not defined 'VMO' in its Local Terminology section."
   *
   * @param {TypeDef[]} types
   * @param {ReleaseDef} release
   * @returns {Promise<Test>}
   */
  async name_spellcheck(types, release) {
    let test = this.qa.tests.start("type_name_spellcheck");
    return this.utils.name_spellcheck__helper(test, types, release);
  }

  /**
   * Check that types have a namespace prefix.
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async prefix_missing(types) {
    let test = this.qa.tests.start("type_prefix_missing");
    let problemTypes = types.filter( type => ! type.prefix );
    return this.qa.tests.post(test, problemTypes, "prefix");
  }

  /**
   * Check that types have a namespace prefix that has been defined in the release.
   * @param {TypeDef[]} types
   * @param {ReleaseDef} release
   * @returns {Promise<Test>}
   */
  async prefix_unknown(types, release) {
    let test = this.qa.tests.start("type_prefix_unknown");
    return this.utils.prefix_unknown__helper(test, types, release);
  }

  /**
   * Check that types have a style.
   *
   * @example "Type PersonType has style 'object'."
   * @example "Type PersonType does not have a style."
   *
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async style_missing(types) {
    let test = this.qa.tests.start("type_style_missing");
    let problemTypes = types.filter( type => ! type.style );
    return this.qa.tests.post(test, problemTypes, "style");
  }

  /**
   * Check that types have a known style.
   *
   * @example "Type PersonType has permitted style 'object'."
   * @example "Type PersonType cannot have unknown style 'myCustomObject'."
   *
   * @param {TypeDef[]} types
   * @returns {Promise<Test>}
   */
  async style_unknown(types) {

    let test = this.qa.tests.start("type_style_unknown");

    let uniqueStyles = new Set( types.map( type => type.style ) );

    /** @type {string[]} */
    let unknownStyles = [];

    uniqueStyles.forEach( style => {
      if (! Type.Styles.includes(style) ) {
        unknownStyles.push(style);
      }
    });

    let problemTypes = types.filter( type => unknownStyles.includes(type.style) );
    return this.qa.tests.post(test, problemTypes, "style");
  }

}

module.exports = TypeUnitTests;
