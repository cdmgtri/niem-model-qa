
let classUnitTestSets = [
  require("./type")
];

function unitTests(qa, niem) {

  classUnitTestSets.forEach( unitTestSet => unitTestSet(qa, niem) );

}

module.exports = unitTests;
