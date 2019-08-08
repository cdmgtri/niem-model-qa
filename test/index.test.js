
let NIEM = require("niem-model-source");
let SourceImplementation = require("niem-model-source-memory");

let NIEMModelQA = require("../src/index");
let unitTests = require("./unit/index");

let { Release } = NIEM.ModelObjects;


let qa = new NIEMModelQA();
let niem = new NIEM( new SourceImplementation() );

/** @type {Release} */
let release;

beforeAll( async () => {
  await qa.loadTests();
  release = await niem.releases.sandbox("user", "model", "1.0");
});

/**
 * @todo Load test suite, then call unit tests
 */
describe("Check test suite", () => {

  test("#load", () => {
    expect(qa.testSuite.tests.length).toBeGreaterThan(20);
    expect(qa.testSuite.status()).toBe("not ran");
  });

  test("#find", () => {
    let test = qa.testSuite.find("type-name-missing-complex");
    expect(test).toBeDefined();
  });

});

// Call unit tests, wrapping inputs in function calls due to Jest execution order
unitTests(() => qa, () => release);
