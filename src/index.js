
let NIEM = require("niem");

let Test = require("./test/index");
let Issue = require("./issue/index");
let checkTypes = require("./checks/type/index");
let checkFacets = require("./checks/facet/index");

let { Release } = NIEM.ModelObjects;

/**
 * @param {Test[]} tests
 * @param {Release} release
 */
async function checkRelease(tests, release) {

  // let tests = await Test.loadTestSuite();

  await checkTypes(tests, release);
  await checkFacets(tests, release);

}

module.exports = {
  checkRelease,
  Test,
  Issue
};
