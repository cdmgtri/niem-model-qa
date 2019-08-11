
let ComponentUnitTests = require("../../component/unit/index");
let { Release, Type } = require("niem-model-source").ModelObjects;

/**
 * Type Unit Tests
 */
class TypeQA_UnitTests extends ComponentUnitTests {

  /**
   * Check that a complex type has a definition.
   * @param {Type[]} types
   */
  async def_missing_complex(types) {
    let problemTypes = types
    .filter( type => type.isComplexType )
    .filter( type => ! type.definition );
    return this.testSuite.post("type_def_missing_complex", problemTypes, "definition");
  }

  /**
   * Check that a simple type has a definition.
   * @param {Type[]} types
   */
  async def_missing_simple(types) {
    let problemTypes = types
    .filter( type => type.isSimpleType )
    .filter( type => ! type.definition );
    return this.testSuite.post("type_def_missing_simple", problemTypes, "definition");
  }

  /**
   * Check that a complex type definition begins with the opening phrase 'A data type '.
   * @param {Type[]} types
   */
  async def_phrase_complex(types) {
    let problemTypes = types
    .filter( type => type.isComplexType && type.definition )
    .filter( type => ! type.definition.startsWith("A data type ") );
    return this.testSuite.post("type_def_phrase_complex", problemTypes, "definition");
  }

  /**
   * Check that a simple type definition begins with the opening phrase 'A data type '.
   * @param {Type[]} types
   */
  async def_phrase_simple(types) {
    let problemTypes = types
    .filter( type => type.isSimpleType && type.definition )
    .filter( type => ! type.definition.startsWith("A data type ") );
    return this.testSuite.post("type_def_phrase_simple", problemTypes, "definition");
  }

  /**
   * Check that words in a type definition are either in the dictionary or defined
   * as Local Terminology.
   * @param {Type[]} types
   * @param {Release} release
   */
  async def_spellcheck(types, release) {
    return this.def_spellcheck__helper("type_def_spellcheck", types, release);
  }

  /**
   * Check that a type name begins with an upper case letter.
   *
   * NDR exceptions:
   * - XML schema types (xs:string)
   * - Proxy XML schema types (niem-xs:string)

   * @param {Type[]} types
   */
  async name_camelCase(types) {

    let problemTypes = types
    .filter( type => type.name )
    .filter( type => type.prefix != "xs" && type.prefix != "niem-xs" )
    .filter( type => type.name[0] == type.name[0].toLowerCase() );

    return this.testSuite.post("type_name_camelCase", problemTypes, "name");
  }

  /**
   * Check that type names are not repeated in a namespace.
   *
   * @param {Type[]} types
   */
  async name_duplicate(types) {
    return this.name_duplicate__helper("type_name_duplicate", types);
  }

  /**
   * Check that a type using representation term "CodeType" follows the same
   * naming pattern as its simple base type.
   *
   * @param {Type[]} types
   */
  async name_inconsistent_codeType(types) {

    let problemTypes = types
    .filter( type => type.name && type.name.endsWith("CodeType") && type.baseName )
    .filter( type => type.name.replace("CodeType", "CodeSimpleType") != type.baseName );

    return this.testSuite.post("type_name_inconsistent_codeType", problemTypes, "name");
  }

  /**
   * Check that all type names use valid characters.
   *
   * @param {Type[]} types
   */
  async name_invalidChar(types) {
    return this.name_invalidChar__helper("type_name_invalidChar", types);
  }

  /**
   * Check that all complex types have names.
   * @param {Type[]} types
   */
  async name_missing_complex(types) {
    let complexTypes = types.filter( type => type.isComplexType );
    return this.name_missing__helper("type_name_missing_complex", complexTypes);
  }

  /**
   * Check that all simple types have names.
   * @param {Type[]} types
   */
  async name_missing_simple(types) {
    let simpleTypes = types.filter( type => type.isSimpleType );
    return this.name_missing__helper("type_name_missing_simple", simpleTypes);
  }

  /**
   * Check that a type with representation term "CodeSimpleType" declares codes.
   * @param {Type[]} types
   */
  async name_repTerm_codeSimpleType(types) {

    let codeSimpleTypes = types.filter( type => type.name && type.name.endsWith("CodeSimpleType"));

    /** @type {Type[]} */
    let problemTypes = [];

    for (let type of codeSimpleTypes) {

      if (!type.facets) {
        // No facets getter on the type - return un-ran test
        return this.testSuite.find("type_name_repTerm_codeSimpleType");
      }

      let facets = await type.facets.find();
      if (facets.length == 0) {
        problemTypes.push(type);
      }
    }

    return this.testSuite.post("type_name_repTerm_codeSimpleType", problemTypes, "name");
  }

  /**
   * Check that a type using representation term "CodeType" has a base type
   * with representation term "CodeSimpleType".
   *
   * @param {Type[]} types
   */
  async name_repTerm_codeType(types) {

    let problemTypes = types
    .filter( type => type.isComplexType && type.name && type.name.endsWith("CodeType") )
    .filter( type => ! type.baseQName || ! type.baseQName.endsWith("CodeSimpleType") );

    return this.testSuite.post("type_name_repTerm_codeType", problemTypes, "name");
  }

  /**
   * Check that complex type names do not end with "SimpleType"
   *
   * @param {Type[]} types
   */
  async name_repTerm_complex(types) {

    let problemTypes = types
    .filter( type => type.isComplexType && type.name )
    .filter( type => type.name.endsWith("SimpleType") );

    return this.testSuite.post("type_name_repTerm_complex", problemTypes, "name");
  }

  /**
   * Check that simple type names end with "SimpleType"
   *
   * NDR exceptions: XML schema types (xs:string)
   *
   * @param {Type[]} types
   */
  async name_repTerm_simple(types) {

    let problemTypes = types
    .filter( type => type.prefix != "xs" && type.isSimpleType && type.name )
    .filter( type => ! type.name.endsWith("SimpleType") );

    return this.testSuite.post("type_name_repTerm_simple", problemTypes, "name");
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
  async name_repTerm_type(types) {

    let problemTypes = types
    .filter( type => type.prefix != "xs" && type.prefix != "niem-xs" && type.name )
    .filter( type => ! type.name.endsWith("Type") );

    return this.testSuite.post("type_name_repTerm_type", problemTypes, "name");
  }

  /**
   * Check that all type names do not use the term "Type" other than as the
   * final representation term.
   * @param {Type[]} types
   */
  async name_reservedTerm_type(types) {
    let problemTypes = types.filter( type => type.name.match(/Type.*Type/) );
    return this.testSuite.post("type_name_reservedTerm_type", problemTypes, "name");
  }

  /**
   * Check that type name terms are either in the dictionary or defined in
   * Local Terminology.
   *
   * @param {Type[]} types
   * @param {Release} release
   */
  async name_spellcheck(types, release) {
    return this.name_spellcheck__helper("type_name_spellcheck", types, release);
  }

}

module.exports = TypeQA_UnitTests;
