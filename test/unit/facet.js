
let NIEMModelQA = require("../../src/index");

let NIEM = require("niem-model-source");
let { Release, Namespace, Type, Facet, LocalTerm } = NIEM.ModelObjects;

/** @type {Release} */
let release;

/** @type {Facet[]} */
let fieldFacets = [];

let FieldTest = require("./field");

/**
 * @param {NIEMModelQA} qa
 * @param {NIEM} niem
 */
function facetTests(qa, niem) {

  describe("Facet", () => {

    beforeAll( async () => {
      release = (await niem.releases.find())[0];
    });

    describe("Facet unit tests", () => {

      test("#type_unknown", async () => {

        let facets = [
          new Facet(release, "ext:BogusCodeSimpleType", "X"), // invalid
          new Facet(release, "nc:BogusCodeSimpleType", "Y"), // invalid
          new Facet(release, "ext:WeekdayCodeSimpleType", "MON"),
          new Facet(release, null, "MON")
        ];

        fieldFacets.push(...facets);

        release.types.add( new Type(null, "ext", "WeekdayCodeSimpleType", "", "simple") );

        let test = await qa.facet.test.type_unknown(facets, release);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ext:BogusCodeSimpleType - enumeration=X");
        expect(test.issues()[0].problemValue).toBe("ext:BogusCodeSimpleType");

        expect(test.issues()[1].label).toBe("nc:BogusCodeSimpleType - enumeration=Y");
        expect(test.issues()[1].problemValue).toBe("nc:BogusCodeSimpleType");

        expect(test.issues()[2].label).toBe("null - enumeration=MON");
        expect(test.issues()[2].problemValue).toBe(null);
        expect(test.issues().length).toBe(3);
      });

    });

    describe("Facet field tests", () => {

      /** @type {FieldTest} */
      let fieldTest;

      beforeAll( async () => {
        fieldTest = new FieldTest(qa.facet, fieldFacets, release);
      });

      test("#type", async () => {
        await fieldTest.run("type");
      });

      test("#all fields", async () => {
        let testSuite = await fieldTest.run();
        expect(testSuite.tests.length).toBe(fieldTest.fieldTestCount);
      });

    });

  });

}

module.exports = facetTests;
