
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
    expect(issues.length).toBe(98);
    testSuite.printStatus();
  });

});

describe("Reload tests", () => {

  test("save and reload tests", async () => {

    let filePath = "test/tests.json";

    // Save current counts
    let testCount = qa.testSuite.tests.length;
    let issueCount = qa.testSuite.issues().length;

    // Save tests
    await qa.saveTestResults(filePath);

    // Reset and reload tests
    qa.testSuite.tests = [];
    await qa.reloadTestResults(filePath);

    expect(qa.testSuite.tests.length).toBe(testCount);
    expect(qa.testSuite.issues().length).toBe(issueCount);

  })
});

afterAll( async() => {
  await qa.testSuite.report.saveAsFile("test/test-results");
});
