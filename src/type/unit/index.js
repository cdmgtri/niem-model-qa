
let ComponentUnitTests = require("../../component/unit/index");
let { Release, Type } = require("niem-model-source").ModelObjects;

/**
 * Type Unit Tests
 */
class TypeQA_UnitTests extends ComponentUnitTests {

  /**
   * Check that a type using representation term "CodeType" follows the same
   * naming pattern as its simple base type.
   *
   * @example // Type name "HairColorCodeType" is valid with base type "HairColorCodeSimpleType".
   *
   * @example // Type name "HairColorCodeType" is not recommended with base type "EyeColorCodeSimpleType".
   *
   * @param {Type[]} types
   */
  async name_inconsistent_codeType(types) {

    let problemTypes = types
    .filter( type => type.name && type.name.endsWith("CodeType") && type.baseName )
    .filter( type => type.name.replace("CodeType", "CodeSimpleType") != type.baseName );

    return this.testSuite.log("type_name_inconsistent_codeType", problemTypes, "name");
  }

  /**
   * Check that all type names use valid characters.
   *
   * @example Type name "PersonType" uses valid characters.
   * @example Type name "ID#Type" does not use valid characters.
   *
   * @param {Type[]} types
   */
  async name_invalidChar(types) {
    return this.name_invalidChar__helper(types, "type_name_invalidChar");
  }

  /**
   * Check that all complex types have names.
   * @param {Type[]} types
   */
  async name_missing_complex(types) {
    let complexTypes = types.filter( type => type.isComplexType );
    return this.name_missing__helper(complexTypes, "type_name_missing_complex");
  }

  /**
   * Check that all simple types have names.
   * @param {Type[]} types
   */
  async name_missing_simple(types) {
    let simpleTypes = types.filter( type => type.isSimpleType );
    return this.name_missing__helper(simpleTypes, "type_name_missing_simple");
  }

  /**
   * @example Type name "WeekdayCodeSimpleType" is valid if the type declares codes.
   *
   * @example Type name "WeekdayCodeSimpleType" is not valid if the type does not declare codes.
   *
   * @param {Release} release
   * @param {Type[]} types
   */
  async name_repTerm_codeSimpleType(types) {

    let codeSimpleTypes = types.filter( type => type.name && type.name.endsWith("CodeSimpleType"));

    /** @type {Type[]} */
    let problemTypes = [];

    for (let type of codeSimpleTypes) {
      let facets = await type.facets.find();
      if (facets.length == 0) {
        problemTypes.push(type);
      }
    }

    return this.testSuite.log("type_name_repTerm_codeSimpleType", problemTypes, "name");
  }

  /**
   * Check that a type using representation term "CodeType" has a base type
   * with representation term "CodeSimpleType".
   *
   * @example Type name "WeekdayCodeType" is valid with base type "WeekdayCodeSimpleType"
   *
   * @example Type name "WeekdayCodeType" is not valid with base type "string"
   *
   * @param {Type[]} types
   */
  async name_repTerm_codeType(types) {

    let problemTypes = types
    .filter( type => type.isComplexType && type.name && type.name.endsWith("CodeType") )
    .filter( type => ! type.baseQName || ! type.baseQName.endsWith("CodeSimpleType") );

    return this.testSuite.log("type_name_repTerm_codeType", problemTypes, "name");
  }

  /**
   * Check that complex type names do not end with "SimpleType"
   *
   * @example Type name "IDSimpleType" is valid if the type is simple.
   * @example Type name "IDSimpleType" is not valid if the type is complex.
   *
   * @param {Type[]} types
   */
  async name_repTerm_complex(types) {

    let problemTypes = types
    .filter( type => type.isComplexType && type.name )
    .filter( type => type.name.endsWith("SimpleType") );

    return this.testSuite.log("type_name_repTerm_complex", problemTypes, "name");
  }

  /**
   * Check that simple type names end with "SimpleType"
   *
   * NDR exceptions: XML schema types (xs:string)
   *
   * @example Type name "IDSimpleType" is valid if the type is simple.
   * @example Type name "IDType" is not valid if the type is simple.
   *
   * @param {Type[]} types
   */
  async name_repTerm_simple(types) {

    let problemTypes = types
    .filter( type => type.prefix != "xs" && type.isSimpleType && type.name )
    .filter( type => ! type.name.endsWith("SimpleType") );

    return this.testSuite.log("type_name_repTerm_simple", problemTypes, "name");
  }

  /**
   * Check that all type names end with the term "Type"
   *
   * NDR exceptions:
   * - XML schema types (xs:string)
   * - Proxy XML schema types (niem-xs:string)
   *
   * @example Type name "PersonType" is valid.
   * @example Type name "Person" is not valid.
   *
   * @param {Type[]} types
   */
  async name_repTerm_type(types) {

    let problemTypes = types
    .filter( type => type.prefix != "xs" && type.prefix != "niem-xs" && type.name )
    .filter( type => ! type.name.endsWith("Type") );

    return this.testSuite.log("type_name_repTerm", problemTypes, "name");
  }

}

module.exports = TypeQA_UnitTests;
