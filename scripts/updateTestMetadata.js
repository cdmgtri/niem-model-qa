
let QA = require("../index");

QA
.updateTestSuiteJSON()
.then( () => {
  console.log("Tests updated.")
});
