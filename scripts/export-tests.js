
let QA = require("../src/index");

QA
.exportTests("c:/git/model/niem-model-qa/niem-model-qa-tests.xlsx")
.then( () => {
  console.log("Tests updated.")
});
