
let ComponentQA = require("../component/index");

let TypeQA_UnitTests = require("./unit/index");
let TypeQA_FieldTestSuites = require("./field/index");

let { Test, Issue } = ComponentQA;
let { Release, Type } = ComponentQA.ModelObjects;

class TypeQA extends ComponentQA {

  constructor(testSuite) {
    super(testSuite);

    /** @private */
    this.unitTests = new TypeQA_UnitTests(testSuite);

    /** @private */
    this.fieldTestSuites = new TypeQA_FieldTestSuites(this.test);
  }

  /**
   * Individual Type unit tests
   * @type {TypeQA_UnitTests}
   */
  get test() {
    return this.unitTests;
  }

  /**
   * A Type test suite made up of unit tests related to a particular Type field.
   * @type {TypeQA_FieldTestSuites}
   */
  get field() {
    return this.fieldTestSuites;
  }

}

/**
 * @param {Test[]} tests
 * @param {Release} release
 */
async function checkTypes(tests, release) {

  await release.namespaces.add(new Namespace(null, "xs"));
  await release.types.add(new Type(null, "xs", "token", "", "simple"));
  await release.types.add(new Type(null, "xs", "string", "", "simple"));

  let types = await release.types.find();
  let nonXSTypes = types.filter( type => type.prefix != "xs" && type.prefix != "niem-xs");

  checkBases(tests, types);
  await checkPrefixes(tests, nonXSTypes, release);
  checkPatterns(tests, nonXSTypes);

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
