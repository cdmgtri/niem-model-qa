
let NIEM = require("niem-model-source");
let SourceImplementation = require("niem-model-source-memory");

let NIEMModelQA = require("../src/index");
let unitTests = require("./unit/index");

let qa = new NIEMModelQA();
let niem = new NIEM( new SourceImplementation() );

beforeAll( async () => {
  await qa.loadTests();
  await niem.releases.sandbox("user", "model", "1.0");
});

describe("Check test suite", () => {

  test("#load", () => {
    expect(qa.testSuite.tests.length).toBeGreaterThan(20);
    expect(qa.testSuite.status()).toBe("not ran");
  });

  test("#find", () => {
    let test = qa.testSuite.find("type_name_missing_complex");
    expect(test).toBeDefined();
  });

  test("#test metadata", () => {
    qa.saveTestSuiteMetadata("niem-model-qa-tests.json");
  });

});

describe("Class tests", () => {

  // Call unit tests for each Model Object class
  unitTests(qa, niem);

});
