
let QA = require("../index.js").NIEMModelQA;

QA
.updateTestSuiteJSON()
.then( () => {
  console.log("Tests updated.")
});
