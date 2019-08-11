
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

      test("#definition_missing_code", async () => {

        let facets = [
          new Facet(release, "ext:WeekdayCodeSimpleType", "WED", "Wednesday", "enumeration"),

          // invalid
          new Facet(release, "ext:WeekdayCodeSimpleType", "THU", "", "enumeration"),

          new Facet(release, "ext:LengthSimpleType", "10", "", "maxLength")
        ];

        fieldFacets.push(...facets);

        let test = await qa.facet.test.definition_missing_code(facets);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ext:WeekdayCodeSimpleType - enumeration=THU");
        expect(test.issues().length).toBe(1);
      });

      test("#definition_missing_pattern", async () => {

        let facets = [
          new Facet(release, "ext:TelephoneNumberFormatType", "\d{3}-\d{3}-\d{4}", "Telephone number format ###-###-####", "pattern"),

          // invalid
          new Facet(release, "ext:SSNFormatType", "\d{9}", "", "pattern"),

          new Facet(release, "ext:LengthSimpleType", "10", "", "maxLength")
        ];

        fieldFacets.push(...facets);

        let test = await qa.facet.test.definition_missing_pattern(facets);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ext:SSNFormatType - pattern=\d{9}");
        expect(test.issues().length).toBe(1);
      });

      test("#kind_invalid", async () => {

        let facets = [
          new Facet(release, "ext:WeekdayCodeSimpleType", "WED", "", "enumeration"),
          new Facet(release, "ext:WeekdayCodeSimpleType", "THU", "", "ENUM"), // invalid
          new Facet(release, "ext:WeekdayCodeSimpleType", "FRI", "", "code"), // invalid
          new Facet(release, "ext:WeekdayCodeSimpleType", "SAT"), // 'enumeration' added as default
          new Facet(release, "ext:LengthSimpleType", "10", "", "maxLength")
        ];

        fieldFacets.push(...facets);

        let test = await qa.facet.test.kind_invalid(facets);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ext:WeekdayCodeSimpleType - ENUM=THU");
        expect(test.issues()[0].problemValue).toBe("ENUM");

        expect(test.issues()[1].label).toBe("ext:WeekdayCodeSimpleType - code=FRI");
        expect(test.issues()[1].problemValue).toBe("code");
        expect(test.issues().length).toBe(2);
      });

      test("#type_complex", async () => {

        let facets = [
          new Facet(release, "ext:WeekdayCodeSimpleType", "MON"),
          new Facet(release, "nc:PersonType", "MON") // invalid
        ];

        fieldFacets.push(...facets);

        release.types.add( new Type(null, "ext", "WeekdayCodeSimpleType", "", "simple") );
        // release.types.add( new Type(null, "ext", "WeekdayCodeSimpleType", "", "simple") );

        let test = await qa.facet.test.type_complex(facets, release);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("nc:PersonType - enumeration=MON");
        expect(test.issues()[0].problemValue).toBe("nc:PersonType");
        expect(test.issues().length).toBe(1);
      });

      test("#type_repTerm_code", async () => {

        let facets = [
          new Facet(release, "ext:WeekdayCodeSimpleType", "MON", "", "enumeration"),
          new Facet(release, "ext:WeekdaySimpleType", "TUE", "", "enumeration"), // invalid
          new Facet(release, "ext:LengthSimpleType", "10", "", "length")
        ];

        fieldFacets.push(...facets);

        let test = await qa.facet.test.type_repTerm_code(facets, release);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ext:WeekdaySimpleType - enumeration=TUE");
        expect(test.issues()[0].problemValue).toBe("ext:WeekdaySimpleType");
        expect(test.issues().length).toBe(1);
      });

      test("#type_unknown", async () => {

        let facets = [
          new Facet(release, "ext:BogusCodeSimpleType", "X"), // invalid
          new Facet(release, "nc:BogusCodeSimpleType", "Y"), // invalid
          new Facet(release, "ext:WeekdayCodeSimpleType", "MON"),
          new Facet(release, null, "MON")
        ];

        fieldFacets.push(...facets);

        // (type added above)
        // release.types.add( new Type(null, "ext", "WeekdayCodeSimpleType", "", "simple") );

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

      test("#facet_value_duplicate_code", async () => {

        let facets = [
          new Facet(release, "ext:WeekdayCodeSimpleType", "MON"), // invalid
          new Facet(release, "ext:WeekdayCodeSimpleType", "MON"), // invalid
          new Facet(release, "ext:WeekdayCodeSimpleType", "TUE"),
          new Facet(release, "nc:WeekdayCodeSimpleType", "TUE"),
          new Facet(release, null, "TUE")
        ];

        fieldFacets.push(...facets);

        let test = await qa.facet.test.value_duplicate_code(facets, release);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ext:WeekdayCodeSimpleType - enumeration=MON");
        expect(test.issues()[0].problemValue).toBe("MON");

        expect(test.issues()[1].label).toBe("ext:WeekdayCodeSimpleType - enumeration=MON");
        expect(test.issues()[1].problemValue).toBe("MON");
        expect(test.issues().length).toBe(2);
      });

      test("#facet_value_missing", async () => {

        let facets = [
          new Facet(release, "ext:WeekdayCodeSimpleType", "MON"),
          new Facet(release, "a:WeekdayCodeSimpleType"), // invalid
          new Facet(release, "b:WeekdayCodeSimpleType", null), // invalid
          new Facet(release, "c:WeekdayCodeSimpleType", "") // invalid
        ];

        fieldFacets.push(...facets);

        let test = await qa.facet.test.value_missing(facets);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("a:WeekdayCodeSimpleType - enumeration=undefined");
        expect(test.issues()[1].label).toBe("b:WeekdayCodeSimpleType - enumeration=null");
        expect(test.issues()[2].label).toBe("c:WeekdayCodeSimpleType - enumeration=");
        expect(test.issues().length).toBe(3);
      });

    });

    describe("Facet field tests", () => {

      /** @type {FieldTest} */
      let fieldTest;

      beforeAll( async () => {
        fieldTest = new FieldTest(qa.facet, fieldFacets, release);
      });

      test("#definition", async () => {
        await fieldTest.run("definition");
      });

      test("#kind", async () => {
        await fieldTest.run("kind");
      });

      test("#type", async () => {
        await fieldTest.run("type");
      });

      test("#value", async () => {
        await fieldTest.run("value");
      });

      test("#all fields", async () => {
        let testSuite = await fieldTest.run();
        expect(testSuite.tests.length).toBe(fieldTest.fieldTestCount);
      });

    });

  });

}

module.exports = facetTests;
