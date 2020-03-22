
let { NIEM } = require("niem-model");

let NIEMModelQA = require("../src/index");
let unitTests = require("./unit/index");

let qa = new NIEMModelQA();
let niem = new NIEM();

let { Release } = NIEM;

/** @type {Release} */
let release;

beforeAll( async () => {
  await qa.init();
  release = await niem.releases.add("user", "model", "1.0");
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
    qa.saveTestSuiteMetadata("niem-model-qa-tests.json")
  });

});

describe("Class tests", () => {

  // Call unit tests for each Model Object class
  unitTests(qa, niem);

});

describe.skip("Release tests", () => {

  // test("#checkRelease", async () => {
  //   let results = await qa.checkRelease(release);
  //   debugger;
  // });

});

afterAll( async() => {

  await qa.testSuite.saveAsFile("test/test-results");

});
