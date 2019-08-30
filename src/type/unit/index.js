
let NIEMObjectUnitTests = require("../../niem-object/unit");
let { Release, Type } = require("niem-model");

/**
 * Type unit tests
 */
class TypeUnitTests extends NIEMObjectUnitTests {

  /**
   * Check that complex types with simple content (CSC) have a CSC or a simple
   * base type.
   *
   * @example "Simple content type HairColorCodeType can have a base type like HairColorCodeSimpleType (simple type)."
   *
   * @example "Simple content type HairColorCodeType cannot have a type like nc:PersonType (complex object type)."
   *
   * @param {Type[]} types
   * @param {Release} release
   */
  async base_invalid_csc(types, release) {

    let test = this.testSuite.start("type_base_invalid_csc");

    /** @type {Type[]} */
    let problemTypes = [];

    let cscTypes = types.filter( type => type.style == "CSC" && type.baseQName );

    for (let cscType of cscTypes) {
      let baseType = await release.types.get(cscType.baseQName);

      if (baseType && baseType.isComplexContent) {
        problemTypes.push(cscType);
      }
    }

    return this.testSuite.post(test, problemTypes, "baseQName");
  }

  /**
   * Check that simple types have a XML schema base type.
   *
   * @example "Simple type ext:HairColorCodeSimpleType can have base type xs:token."
   * @example "Simple type ext:HairColorCodeSimpleType should not have base type ext:ColorCodeSimpleType."
   *
   * @param {Type[]} types
   * @param {Release} release
   */
  async base_invalid_simple(types, release) {

    let test = this.testSuite.start("type_base_invalid_simple");

    /** @type {Type[]} */
    let problemTypes = [];

    let simpleTypes = types.filter( type => type.style == "simple" && type.baseQName );

    for (let simpleType of simpleTypes) {
      let baseType = await release.types.get(simpleType.baseQName);

      if (baseType && baseType.prefix != "xs") {
        problemTypes.push(simpleType);
      }
    }

    return this.testSuite.post(test, problemTypes, "baseQName");
  }

  /**
   * Check that simple content types have a base.
   *
   * @example "Type HairColorCodeSimpleType needs a base type like xs:string or xs:token."
   * @example "Type HairColorCodeSimpleType is not valid without a base type."
   *
   * @param {Type[]} types
   */
  async base_missing_simpleContent(types) {
    let test = this.testSuite.start("type_base_missing_simpleContent");
    let problemTypes = types.filter( type => type.isSimpleContent && ! type.baseQName )
    return this.testSuite.post(test, problemTypes, "baseQName");
  }

  /**
   * Check that type bases exist.
   *
   * @example "Type PersonType can extend type structures:ObjectType (this type exists)."
   * @example "Type PersonType cannot extend type structures:BogusType (this type does not exist)."
   *
   * @param {Type[]} types
   * @param {Release} release
   */
  async base_unknown(types, release) {

    let test = this.testSuite.start("type_base_unknown");

    /** @type {Type[]} */
    let problemTypes = [];

    // Get all types that have a base type
    let basedTypes = types.filter( type => type.baseQName );

    for (let type of basedTypes) {
      let baseType = await release.types.get(type.baseQName);

      if (! baseType) {
        problemTypes.push(type);
      }
    }

    return this.testSuite.post(test, problemTypes, "baseQName");
  }

  /**
   * Check that a complex type has a definition.
   * @param {Type[]} types
   */
  async definition_missing_complex(types) {
    let test = this.testSuite.start("type_definition_missing_complex");
    let problemTypes = types.filter( type => type.isComplexType && ! type.definition )
    return this.testSuite.post(test, problemTypes, "definition");
  }

  /**
   * Check that a simple type has a definition.
   * @param {Type[]} types
   */
  async definition_missing_simple(types) {
    let test = this.testSuite.start("type_definition_missing_simple");
    let problemTypes = types.filter( type => type.isSimpleType && ! type.definition )
    return this.testSuite.post(test, problemTypes, "definition");
  }

  /**
   * Check that a complex type definition begins with the opening phrase 'A data type '.
   *
   * @example "Definition 'A data type for a human being' is valid for type 'PersonType'."
   * @example "Definition 'A human being' is not valid for type 'PersonType'."
   *
   * @param {Type[]} types
   */
  async definition_phrase_complex(types) {

    let test = this.testSuite.start("type_definition_phrase_complex");

    let problemTypes = types
    .filter( type => type.isComplexType && type.definition )
    .filter( type => ! type.definition.startsWith("A data type ") );

    return this.testSuite.post(test, problemTypes, "definition");
  }

  /**
   * Check that a simple type definition begins with the opening phrase 'A data type '.
   *
   * @example "Definition 'A data type for United States state codes' is valid for type usps:StateCodeSimpleType."
   *
   * @example "Definition 'United States state codes' is not valid for type usps:StateCodeSimpleType."
   *
   * @param {Type[]} types
   */
  async definition_phrase_simple(types) {

    let test = this.testSuite.start("type_definition_phrase_simple");

    let problemTypes = types
    .filter( type => type.isSimpleType && type.definition )
    .filter( type => ! type.definition.startsWith("A data type ") );

    return this.testSuite.post(test, problemTypes, "definition");
  }

  /**
   * Check that words in a type definition are either in the dictionary or defined
   * as Local Terminology.
   *
   * @example "Definition 'A data type for FIPS state codes' is valid if the term 'FIPS' is defined as Local Terminology in that namespace."
   *
   * @example "Definition 'A data type for FIPS state codes' is not recommended if the term 'FIPS' is not defined as Local Terminology in that namespace."
   *
   * @param {Type[]} types
   * @param {Release} release
   */
  async definition_spellcheck(types, release) {
    let test = this.testSuite.start("type_definition_spellcheck");
    return this.utils.definition_spellcheck__helper(test, types, release);
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

   * @param {Type[]} types
   */
  async name_camelCase(types) {

    let test = this.testSuite.start("type_name_camelCase");

    let problemTypes = types
    .filter( type => type.name )
    .filter( type => type.prefix != "xs" && type.prefix != "niem-xs" )
    .filter( type => type.name[0] == type.name[0].toLowerCase() );

    return this.testSuite.post(test, problemTypes, "name");
  }

  /**
   * Check that type names are not repeated in a namespace.
   *
   * @example "Types 'justice:CaseType' and 'logistics:CaseType' are valid because even though they use the same name, they are defined in different namespaces."
   * @example "Type name 'CaseType' cannot be defined twice in the justice namespace."
   *
   * @param {Type[]} types
   */
  async name_duplicate(types) {
    let test = this.testSuite.start("type_name_duplicate");
    return this.utils.name_duplicate__helper(test, types);
  }

  /**
   * Check that a type using representation term "CodeType" follows the same
   * naming pattern as its simple base type.
   *
   * @example "Type name 'HairColorCodeType' is valid with base type 'HairColorCodeSimpleType'."
   *
   * @example "Type name 'HairColorCodeType' is not recommended with base type 'EyeColorCodeSimpleType'."
   *
   * @param {Type[]} types
   */
  async name_inconsistent_codeType(types) {

    let test = this.testSuite.start("type_name_inconsistent_codeType");

    let problemTypes = types
    .filter( type => type.name && type.name.endsWith("CodeType") && type.baseName )
    .filter( type => type.name.replace("CodeType", "CodeSimpleType") != type.baseName );

    return this.testSuite.post(test, problemTypes, "name");
  }

  /**
   * Check that all type names use valid characters.
   *
   * @example "Type name 'PersonType' uses valid characters."
   * @example "Type name 'ID#Type' does not use valid characters."
   *
   * @param {Type[]} types
   */
  async name_invalidChar(types) {
    let test = this.testSuite.start("type_name_invalidChar");
    return this.utils.name_invalidChar__helper(test, types);
  }

  /**
   * Check that all complex types have names.
   * @param {Type[]} types
   */
  async name_missing_complex(types) {
    let test = this.testSuite.start("type_name_missing_complex");
    let complexTypes = types.filter( type => type.isComplexType );
    return this.utils.name_missing__helper(test, complexTypes);
  }

  /**
   * Check that all simple types have names.
   * @param {Type[]} types
   */
  async name_missing_simple(types) {
    let test = this.testSuite.start("type_name_missing_simple");
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
   * @param {Type[]} types
   */
  async name_repTerm_codeSimpleType(types) {

    let test = this.testSuite.start("type_name_repTerm_codeSimpleType");

    let codeSimpleTypes = types.filter( type => type.name && type.name.endsWith("CodeSimpleType"));

    /** @type {Type[]} */
    let problemTypes = [];

    for (let type of codeSimpleTypes) {

      if (!type.facets) {
        // No facets getter on the type - return un-ran test
        return test;
      }

      let facets = await type.facets.find();
      if (facets.length == 0) {
        problemTypes.push(type);
      }
    }

    return this.testSuite.post(test, problemTypes, "name");
  }

  /**
   * Check that a type using representation term "CodeType" has a base type
   * with representation term "CodeSimpleType".
   *
   * @example "Type name 'WeekdayCodeSimpleType' is not valid if the type does not declare codes."
   *
   * @example "Type name 'WeekdayCodeType' is not valid with base type 'string'"
   *
   * @param {Type[]} types
   */
  async name_repTerm_codeType(types) {

    let test = this.testSuite.start("type_name_repTerm_codeType");

    let problemTypes = types
    .filter( type => type.isComplexType && type.name && type.name.endsWith("CodeType") )
    .filter( type => ! type.baseQName || ! type.baseQName.endsWith("CodeSimpleType") );

    return this.testSuite.post(test, problemTypes, "name");
  }

  /**
   * Check that complex type names do not end with "SimpleType"
   *
   * @example "Type name 'IDSimpleType' is valid if the type is simple."
   * @example "Type name 'IDSimpleType' is not valid if the type is complex."
   *
   * @param {Type[]} types
   */
  async name_repTerm_complex(types) {

    let test = this.testSuite.start("type_name_repTerm_complex");

    let problemTypes = types
    .filter( type => type.isComplexType && type.name )
    .filter( type => type.name.endsWith("SimpleType") );

    return this.testSuite.post(test, problemTypes, "name");
  }

  /**
   * Check that simple type names end with "SimpleType"
   *
   * NDR exceptions: XML schema types (xs:string)
   *
   * @example "Type name 'IDSimpleType' is valid if the type is simple."
   * @example "Type name 'IDType' is not valid if the type is simple."
   *
   * @param {Type[]} types
   */
  async name_repTerm_simple(types) {

    let test = this.testSuite.start("type_name_repTerm_simple");

    let problemTypes = types
    .filter( type => type.prefix != "xs" && type.isSimpleType && type.name )
    .filter( type => ! type.name.endsWith("SimpleType") );

    return this.testSuite.post(test, problemTypes, "name");
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
   * @param {Type[]} types
   */
  async name_repTerm_type(types) {

    let test = this.testSuite.start("type_name_repTerm_type");

    let problemTypes = types
    .filter( type => type.prefix != "xs" && type.prefix != "niem-xs" && type.name )
    .filter( type => ! type.name.endsWith("Type") );

    return this.testSuite.post(test, problemTypes, "name");
  }

  /**
   * Check that all type names do not use the term "Type" other than as the
   * final representation term.
   *
   * @example "Type name 'IDCategoryCodeType' is valid because the term 'Type' only appears at the end of the name."
   *
   * @example "Type name 'IDTypeCodeType' is not valid because the term 'Type' is used in the middle of the name."
   *
   * @param {Type[]} types
   */
  async name_reservedTerm_type(types) {
    let test = this.testSuite.start("type_name_reservedTerm_type");
    let problemTypes = types.filter( type => type.name.match(/Type.*Type/) );
    return this.testSuite.post(test, problemTypes, "name");
  }

  /**
   * Check that type name terms are either in the dictionary or defined in
   * Local Terminology.
   *
   * @example "Type name 'ncic:VMOCodeType' is valid if the ncic namespace defines the meaning of 'VMO' in its Local Terminology section."
   *
   * @example "Type name 'ncic:VMOCodeType' is not valid if the ncic namespace does not defined 'VMO' in its Local Terminology section."
   *
   * @param {Type[]} types
   * @param {Release} release
   */
  async name_spellcheck(types, release) {
    let test = this.testSuite.start("type_name_spellcheck");
    return this.utils.name_spellcheck__helper(test, types, release);
  }

  /**
   * Check that types have a namespace prefix.
   * @param {Type[]} types
   */
  async prefix_missing(types) {
    let test = this.testSuite.start("type_prefix_missing");
    let problemTypes = types.filter( type => ! type.prefix );
    return this.testSuite.post(test, problemTypes, "prefix");
  }

  /**
   * Check that types have a namespace prefix that has been defined in the release.
   * @param {Type[]} types
   * @param {Release} release
   */
  async prefix_unknown(types, release) {
    let test = this.testSuite.start("type_prefix_unknown");
    return this.utils.prefix_unknown__helper(test, types, release);
  }

  /**
   * Check that types have a style.
   *
   * @example "Type PersonType has style 'object'."
   * @example "Type PersonType does not have a style."
   *
   * @param {Type[]} types
   */
  async style_missing(types) {
    let test = this.testSuite.start("type_style_missing");
    let problemTypes = types.filter( type => ! type.style );
    return this.testSuite.post(test, problemTypes, "style");
  }

  /**
   * Check that types have a known style.
   *
   * @example "Type PersonType has permitted style 'object'."
   * @example "Type PersonType cannot have unknown style 'myCustomObject'."
   *
   * @param {Type[]} types
   */
  async style_unknown(types) {

    let test = this.testSuite.start("type_style_unknown");

    let uniqueStyles = new Set( types.map( type => type.style ) );

    /** @type {String[]} */
    let unknownStyles = [];

    uniqueStyles.forEach( style => {
      if (! Type.Styles.includes(style) ) {
        unknownStyles.push(style);
      }
    });

    let problemTypes = types.filter( type => unknownStyles.includes(type.style) );
    return this.testSuite.post(test, problemTypes, "style");
  }

}

module.exports = TypeUnitTests;
