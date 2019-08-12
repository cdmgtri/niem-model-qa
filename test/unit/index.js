
let NIEMModelQA = require("../../index");

let classUnitTestSets = [
  require("./type"),
  require("./facet")
];

/**
 * @param {NIEMModelQA} qa
 */
module.exports = (qa, niem) => {

  classUnitTestSets.forEach( unitTestSet => unitTestSet(qa, niem) );

}
