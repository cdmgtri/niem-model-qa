
let NIEMModelQA = require("../../src/index");

let classUnitTestSets = [
  require("./type")
];

/**
 * @param {NIEMModelQA} qa
 */
module.exports = (qa, niem) => {

  classUnitTestSets.forEach( unitTestSet => unitTestSet(qa, niem) );

}
