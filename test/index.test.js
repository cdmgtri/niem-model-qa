
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
  await qa.testSuite.loadTestSpreadsheet("niem-model-qa-tests.xlsx");
  release = await niem.releases.add("user", "model", "1.0");
});

describe("Check test suite", () => {

  test("#load", () => {
    expect(qa.testSuite.tests.length).toBeGreaterThan(20);
    expect(qa.testSuite.tests.length).toBeLessThan(500);
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

describe("Release tests", () => {

  test("#checkRelease", async () => {
    let testSuite = await qa.checkRelease(release);
    let issues = testSuite.issues();
    expect(issues.length).toBe(95);
    testSuite.printStatus();
  });

});

afterAll( async() => {
  await qa.testSuite.report.saveAsFile("test/test-results");
});
