
let ComponentUnitTests = require("../../component/unit/index");
let { Type } = require("niem-model-objects");

class TypeUnitTests extends ComponentUnitTests {

  /**
   * Check that all simple types have names.
   * @param {Type[]} types
   */
  name_missing_simple(types) {
    let simpleTypes = types.filter( type => type.isSimpleType );
    return this.name_missing__helper(simpleTypes, "type-name-missing-simple");
  }

  /**
   * Check that all complex types have names.
   * @param {Type[]} types
   */
  name_missing_complex(types) {
    let complexTypes = types.filter( type => type.isComplexType );
    return this.name_missing__helper(complexTypes, "type-name-missing-complex");
  }

  /**
   * Check that all type names use valid characters.
   * @param {Type[]} types
   */
  name_invalidChar(types) {
    return this.name_invalidChar__helper(types, "type-name-invalidChar");
  }

  /**
   * Check that all type names end with the term "Type"
   *
   * NDR exceptions:
   * - XML schema types (xs:string)
   * - Proxy XML schema types (niem-xs:string)
   *
   * @param {Type[]} types
   */
  name_repTerm_type(types) {

    let problemTypes = types
    .filter( type => type.prefix != "xs" && type.prefix != "niem-xs" && type.name )
    .filter( type => ! type.name.endsWith("Type") );

    return this.testSuite.log("type-name-repTerm", problemTypes, "name");
  }

  /**
   * Check that simple type names end with "SimpleType"
   *
   * NDR exceptions: XML schema types (xs:string)
   *
   * @param {Type[]} types
   */
  name_repTerm_simple(types) {

    let problemTypes = types
    .filter( type => type.prefix != "xs" && type.isSimpleType && type.name )
    .filter( type => ! type.name.endsWith("SimpleType") );

    return this.testSuite.log("type-name-repTerm-simple", problemTypes, "name");
  }

  /**
   * Check that complex type names do not end with "SimpleType"
   *
   * @param {Type[]} types
   */
  name_repTerm_complex(types) {

    let problemTypes = types
    .filter( type => type.isComplexType && type.name )
    .filter( type => type.name.endsWith("SimpleType") );

    return this.testSuite.log("type-name-repTerm-complex", problemTypes, "name");
  }

  /**
   * Check that a type using representation term "CodeType" has a base type
   * with representation term "CodeSimpleType".
   *
   * @param {Type[]} types
   */
  name_repTerm_codeType(types) {

    let problemTypes = types
    .filter( type => type.isComplexType && type.name && type.name.endsWith("CodeType") )
    .filter( type => ! type.baseQName || ! type.baseQName.endsWith("CodeSimpleType") );

    return this.testSuite.log("type-name-repTerm-codeType", problemTypes, "name");
  }

  /**
   * Check that a type using representation term "CodeType" follows the same
   * naming pattern as its simple base type.
   *
   * @todo - Need to drop the prefix from baseQName for comparison. Add as Type getter?
   *
   * @example "HairColorCodeType" is a valid name with base "HairColorCodeSimpleType".
   *
   * @example "HairColorCodeType" is not a valid name with base "EyeColorCodeSimpleType".
   *
   * @param {Type[]} types
   */
  name_inconsistent_codeType(types) {

    let problemTypes = types
    .filter( type => type.name && type.name.endsWith("CodeType") && type.baseQName )
    .filter( type => type.name.replace("CodeType", "CodeSimpleType") != type.baseQName );

    return this.testSuite.log("type-name-inconsistent-codeType", problemTypes, "name");
  }

}

module.exports = TypeUnitTests;
