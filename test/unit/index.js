
let classUnitTestSets = [
  require("./type")
];

/**
 * @param {Function} returnQA
 * @param {Function} returnRelease
 */
function unitTests(returnQA, returnRelease) {

  let qa = returnQA();
  let release = returnRelease();

  classUnitTestSets.forEach( unitTestSet => unitTestSet(qa, release) );

}

module.exports = unitTests;
