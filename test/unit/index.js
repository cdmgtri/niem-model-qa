
let NIEMModelQA = require("../../src/index");

let classUnitTestSets = [
  require("./property"),
  require("./type"),
  require("./facet")
];

/**
 * @param {NIEMModelQA} qa
 */
module.exports = (qa, niem) => {

  classUnitTestSets.forEach( unitTestSet => unitTestSet(qa, niem) );

}
