
let NIEMModelQA = require("../src/index");

let NIEM = require("niem-model-source");
let SourceImplementation = require("niem-model-source-memory");
let { Release, Type } = NIEM.ModelObjects;

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

describe("Check types", () => {

    let cscType = new Type(null, "usps", "StateCodeType", "A data type for a state code.", "", "usps:StateCodeSimpleType");

    let simpleType = new Type(null, "usps", "StateCodeType", "A data type for a state code.", "", "usps:StateCodeSimpleType");



    /**
     * Checks simple types for missing names.
     */
    test("#checkNames_missing_simple", () => {

      let types = [
        new Type(release, "ext", "NameType", "", "simple"),
        new Type(release, "ext", "", null , "simple"), // invalid
        new Type(release, "ext", "", null, "association"),
      ];

      let test = qa.typeQA.checkNames_missing_simple(types);

      //  test = qa.types.names.missing.all()
      //  test = qa.types.names.missing.complex()
      //  test = qa.types.names.missing.simple()

      //  test = qa.type.name.missing.all()
      //  test = qa.type.name.missing.complex()
      //  test = qa.type.name.missing.simple()

      //  test = qa.type.name-missing-all()
      //  test = qa.type.name-missing-complex()
      //  test = qa.type.name-missing-simple()

      expect(test.failed()).toBeTruthy();
      expect(test.issues().length).toBe(1);
    });

    /**
     * Checks complex types for missing names.
     */
    test("#checkNames_missing_complex", () => {

      let types = [
        new Type(release, "ext", "NameType", "", "object"),
        new Type(release, "ext", "", null, "association"), // invalid
        new Type(release, "ext", "", null , "simple")
      ];

      let test = qa.typeQA.checkNames_missing_complex(types);

      expect(test.failed()).toBeTruthy();
      expect(test.issues().length).toBe(1);
    });

    /**
     * Checks type names for invalid characters.
     */
    test("#checkNames_invalidChars", () => {

      let types = [
        new Type(release, "ext", "NameType"),
        new Type(release, "ext", "CarType "), // invalid
        new Type(release, "ext", "ID#") // invalid
      ];

      let test = qa.typeQA.checkNames_invalidChar(types);

      expect(test.failed()).toBeTruthy();
      expect(test.issues()[0].problemValue).toBe("CarType ");
      expect(test.issues()[1].problemValue).toBe("ID#");
      expect(test.issues().length).toBe(2);
    });

    test("#checkNames_repTerms_all", () => {

      let types = [
        new Type(release, "ext", "NameType"),
        new Type(release, "ext", "Car_type "), // invalid
        new Type(release, "ext", "ID#") // invalid
      ];

      let test = qa.typeQA.checkNames_repTerms_all(types);

      expect(test.failed()).toBeTruthy();
      expect(test.issues()[0].problemValue).toBe("Car_type ");
      expect(test.issues()[1].problemValue).toBe("ID#");
      expect(test.issues().length).toBe(2);
    });

});
