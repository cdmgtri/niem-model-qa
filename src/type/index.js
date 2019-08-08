
let ComponentQA = require("../component/index");

let TypeUnitTests = require("./unit/index");
let TypeFieldTests = require("./field/index");

let { Test, Issue } = ComponentQA;
let { Release, Type } = ComponentQA.ModelObjects;

/**
 * @todo Refactor
 */
class TypeQA extends ComponentQA {

  constructor(testSuite) {
    super(testSuite);
    this.test = new TypeUnitTests(testSuite);
    this.field = new TypeFieldTests(this.test);
  }

  /**
   * @param {Release} release
   * @param {Type[]} types
   */
  async run(release, types) {
    return super.run(release, types);
  }

  /**
   * Type unit tests.
   *
   * Checks type information locally, without following any references to
   * other related types, namespaces, sub-properties, or facets.
   *
   * @example Checks that a type's definition begins with the correct opening phrase.
   *
   * @param {Type[]} types
   */
  unitTests(types) {
    return [
      ...this.unitTests_names(types)
    ]

  }

  /**
   * @param {Type[]} types
   */
  unitTests_names(types) {
    return [
      this.test_name_missing_simple(types),
      this.test_name_missing_complex(types),
      this.test_name_invalidChar(types),

      ...this.unitTests_names_repTerms(types),

    ];
  }

  /**
   * @param {Type[]} types
   */
  unitTests_names_repTerms(types) {
    return [
      this.test_name_repTerm_all(types)
    ]
  }


  // **************************************************************************
  // **************************************************************************



  /**
   * Type integration tests.
   *
   * Checks type information locally, without following any references to
   * other related types, namespaces, sub-properties, or facets.
   *
   * @example Checks that a type has an appropriate parent type.
   *
   * @param {Release} release
   * @param {Type[]} types
   * @returns {Test[]}
   */
  async referenceTests(release, types) {

  }

  /**
   * @todo Reference check names
   * @param {Release} release
   * @param {Type[]} types
   */
  referenceCheckNames(release, types) {

  }

}

/**
 * @todo Handle XS simple types better
 * @param {Test[]} tests
 * @param {Release} release
 */
async function checkTypes(tests, release) {

  await release.namespaces.add(new Namespace(null, "xs"));
  await release.types.add(new Type(null, "xs", "token", "", "simple"));
  await release.types.add(new Type(null, "xs", "string", "", "simple"));

  let types = await release.types.find();
  let nonXSTypes = types.filter( type => type.prefix != "xs" && type.prefix != "niem-xs");

  await checkNames(tests, nonXSTypes);
  checkDefinitions(tests, nonXSTypes);
  checkBases(tests, types);
  await checkPrefixes(tests, nonXSTypes, release);
  checkPatterns(tests, nonXSTypes);

}

/**
 * Check type names for NDR and QA issues
 *
 * @param {Test[]} tests
 * @param {Type[]} types
 */
async function checkNames(tests, types) {

  let namedTypes = types.filter( type => type.name );

  await checkRepTerms(tests, namedTypes);
  checkDuplicates(tests, namedTypes);
  checkTermType(tests, namedTypes);
  checkCamelCase(tests, namedTypes);
}

/**
 * Check that types have the appropriate representation term.
 *
 * @todo QA check for components with missing names
 *
 * @param {Test[]} tests
 * @param {Type[]} types
 */
async function checkRepTerms(tests, types) {

  // Do not return hits on types with missing names.  Other QA checks will flag those.
  let typesWithNames = types.filter( type => type.name );

  let simpleTypes = typesWithNames.filter( type => ! type.isComplexType );
  let codeSimpleTypes = simpleTypes.filter( type => type.name.endsWith("CodeSimpleType") );


  // Check that "CodeSimpleType" types have enumerations
  let test = Test.run(tests, "type-name-codeSimpleType-invalid");
  for (let type of codeSimpleTypes) {
    let facets = await type.facets.find();
    if (facets.length == 0) {
      let issue = new Issue(type.label, type.source.location, type.source.line, "name", type.name);
      test.issues.push(issue);
    }
  }

}

/**
 * @todo Abstract as a component test
 * @param {Test[]} tests
 * @param {Type[]} types
 */
function checkDuplicates(tests, types) {

  let test = Test.run(tests, "type-name-all-duplicate");

  // Create an object with qnames (keys) and qname counts (values)
  let typeCounts = {};
  types.forEach( type => {
    let qname = type.qname;
    typeCounts[qname] = qname in typeCounts ? typeCounts[qname] + 1 : 1;
  });

  // Create an issue for each duplicated qname
  for (let [qname, count] of Object.entries(typeCounts)) {
    if (count > 1) {
      types
        .filter( type => type.qname == qname )
        .forEach( type => {
          let issue = new Issue(type.label, type.source.location, type.source.line, "", qname);
          test.issues.push(issue);
        });
    }

  }
}

/**
 * Find types that use the reserved term "Type" as other than the final
 * representation term.
 *
 * @param {Test[]} tests
 * @param {Type[]} types
 */
function checkTermType(tests, types) {

  let problemTypes = types.filter( type => type.name.match(/Type.*Type/) );
  return logResults(tests, problemTypes, "type-name-term-type", "qname");

}

/**
 * Check that type names are UpperCamelCase.
 *
 * @param {Test[]} tests
 * @param {Type[]} types
 */
function checkCamelCase(tests, types) {
  let problemTypes = types.filter( type => {
    if (! type.name) {
      return false;
    }

    let firstChar = type.name[0];
    return firstChar == firstChar.toLowerCase();
  });
  return logResults(tests, problemTypes, "type-name-all-camelCase", "name");
}

/**
 * Check type definitions.
 *
 * @param {Test[]} tests
 * @param {Type[]} types
 */
function checkDefinitions(tests, types) {

  // Missing definitions
  problemTypes = types.filter( type => ! type.definition );
  logResults(tests, problemTypes, "type-def-all-missing");

  let defTypes = types.filter( type => type.definition );

  // All types that do not start with "A data type "
  problemTypes = defTypes.filter( type => ! type.definition.startsWith("A data type "));
  logResults(tests, problemTypes, "type-def-all-phrase", "definition");

}

/**
 * Check type definitions.
 *
 * @todo Handle reuse of NIEM types as bases
 *
 * @param {Test[]} tests
 * @param {Type[]} types
 */
function checkBases(tests, types) {

  let basedTypes = types.filter( type => type.baseQName );

  // Check that base types exist
  let problemTypes = basedTypes.filter( basedType => {
    return ! types.find( type => type.qname == basedType.baseQName);
  });
  logResults(tests, problemTypes, "type-base-all-invalid", "baseQName");

  // Check that a CSC or simple type has a base
  problemTypes = types.filter( type => {
    return ! type.isComplexContent && ! type.baseQName  && type.prefix != "xs"
  });
  logResults(tests, problemTypes, "type-base-simpleContent-missing", "baseQName");

  // Check that a CSC type has a CSC or simple base
  problemTypes = basedTypes
    .filter( basedType => basedType.pattern == "CSC" && basedType.baseQName )
    .filter( basedType => {
      let baseType = types.find( type => type.qname == basedType.baseQName );
      return baseType && baseType.isComplexContent;
    })
  logResults(tests, problemTypes, "type-base-csc-invalid", "baseQName");

  // Check that a simple type has a XML Schema simple base type
  problemTypes = basedTypes.filter( type => {
    let baseQName = type.baseQName;
    if (! baseQName.includes(":")) {
      return true;
    }
    return ! type.isComplexType && type.baseQName.split(":")[0] != "xs";
  });
  logResults(tests, problemTypes, "type-base-simple-invalid", "baseQName");

  // A CSC type with a "CodeSimpleType" base must be named similarly
  problemTypes = basedTypes
    .filter( type => type.baseQName.includes(":") )
    .filter( type => type.baseQName.endsWith("CodeSimpleType") )
    .filter( type => {
      let expectedName = type.baseQName.split(":")[1].replace("CodeSimpleType", "CodeType");
      return type.name != expectedName;
    });
  logResults(tests, problemTypes, "type-name-codeType-inconsistent", "baseQName");

}

/**
 * Check type namespace prefixes.
 *
 * @todo Abstract to a component test.
 * @todo Abstract check for unknown prefixes
 *
 * @param {Test[]} tests
 * @param {Type[]} types
 * @param {Release} release
 */
async function checkPrefixes(tests, types, release) {

  // Missing namespace prefixes
  let problemTypes = types.filter( type => ! type.prefix );
  logResults(tests, problemTypes, "type-prefix-all-missing");


  // Check for namespace prefixes that do not exist

  let prefixes = new Set( types.map( type => type.prefix ));

  let unknownPrefixes = [];
  for (let prefix of prefixes) {
    let ns = await release.namespaces.get(prefix);
    if (! ns) {
      unknownPrefixes.push(prefix);
    }
  }

  problemTypes = types
    .filter( type => type.prefix && unknownPrefixes.includes(type.prefix) );
  logResults(tests, problemTypes, "type-prefix-all-invalid");

}

/**
 * Check that types have values for all required fields.
 *
 * @param {Test[]} tests
 * @param {Type[]} types
 */
function checkPatterns(tests, types) {

  // Missing patterns
  problemTypes = types.filter( type => ! type.pattern );
  logResults(tests, problemTypes, "type-style-all-missing");

}


module.exports = TypeQA;
