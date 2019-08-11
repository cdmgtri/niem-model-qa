
let NIEM = require("niem");
let Test = require("../../test/index");
let Issue = require("../../issue/index");

let { Release, Facet, Type, Namespace } = NIEM.ModelObjects;
let { logResults } = Test;


/**
 * @param {Test[]} tests
 * @param {Release} release
 */
async function checkFacets(tests, release) {

  let facets = await release.facets.find();

  await checkNames(tests, facets, release);
  checkValues(tests, facets);
  checkDefs(tests, facets);

}

/**
 * @todo Abstract unknown reference test
 *
 * @param {Test[]} tests
 * @param {Facet[]} facets
 * @param {Release} release
 */
async function checkNames(tests, facets, release) {

  let typedFacets = facets.filter( facet => facet.typePrefix && facet.typeName );

  // Check that a type name is provided
  let problems = facets.filter( facet => ! facet.typeName );
  logResults(tests, problems, "facet-name-all-missing");


  // Check that the type name exists
  let qnames = new Set( facets.map( facet => facet.typeQName) );

  let unknownQNames = [];
  for (let qname of qnames) {
    let type = await release.types.get(qname);
    if (!type) {
      unknownQNames.push(qname);
    }
  }

  problems = typedFacets.filter( facet => unknownQNames.includes(facet.typeQName) );
  logResults(tests, problems, "facet-name-all-invalid", "typeQName");

  // Check that codes belong to a "CodeSimpleType" type
  problems = facets.filter( facet => facet.kind == "enumeration" && ! facet.typeQName.endsWith("CodeSimpleType"));
  logResults(tests, problems, "facet-name-code-invalid", "typeQName");

  // Check that facets belong to a "SimpleType" type
  problems = facets.filter( facet => ! facet.typeName.endsWith("SimpleType") );
  logResults(tests, problems, "facet-name-all-complex", "typeQName");

}

/**
 * @todo Abstract count check
 *
 * @param {Test[]} tests
 * @param {Facet[]} facets
 */
function checkValues(tests, facets) {

  let valueFacets = facets.filter( facet => facet.value );

  // Check that facets have values
  let problems = facets.filter( facet => ! facet.value );
  logResults(tests, problems, "facet-value-all-missing");

  // Check for types that have duplicate facets
  let labelCounts = {};

  valueFacets
    .filter( facet => facet.kind == "enumeration" )
    .forEach( facet => {
      let label = facet.label;
      labelCounts[label] = label in labelCounts ? labelCounts[label] + 1 : 1;
    });

  problems = valueFacets
    .filter( facet => facet.kind == "enumeration" )
    .filter( facet => labelCounts[facet.label] > 1 );

  logResults(tests, problems, "facet-value-code-duplicate", "value");

}

/**
 * @param {Test[]} tests
 * @param {Facet[]} facets
 */
function checkDefs(tests, facets) {

  let problems = facets.filter( facet => facet.kind == "enumeration" && ! facet.definition );
  logResults(tests, problems, "facet-def-code-missing");

  problems = facets.filter( facet => facet.kind == "pattern" && ! facet.definition );
  logResults(tests, problems, "facet-def-pattern-missing");

}

module.exports = checkFacets;
