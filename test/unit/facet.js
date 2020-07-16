
let { NIEM, Release, Facet } = require("niem-model");

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

      test.skip("#definition_formatting_specialChars", async () => {

        let facets = [
          new Facet("can:CanadianProvinceCodeSimpleType", "QC", "Québec"),

          new Facet("genc:CountryAlpha2CodeSimpleType", "CI", "CÃ”TE Dâ€™IVOIRE"),
          new Facet("genc:CountryAlpha3CodeSimpleType", "CIV", "CÔTE D’IVOIRE"),
          new Facet("genc:CountryNumericCodeSimpleType", "384", "CÔTE D’IVOIRE"),
          new Facet("genc:CountrySubdivisionCodeSimpleType", "AD-06", "Sant Julià de Lòria"),

          new Facet("iso_3166:CountryAlpha2CodeSimpleType", "CI", "Côte d'Ivoire"),
          new Facet("iso_3166:CountryAlpha3CodeSimpleType", "CIV", "Côte d'Ivoire"),
          new Facet("iso_3166:CountryNumericCodeSimpleType", "384", "CÃ”TE Dâ€™IVOIRE"),
          new Facet("iso_3166:CountrySubdivisionCodeSimpleType", "AD-06", "Sant Julià de Lòria"),

          new Facet("iso_639-3:LanguageCodeSimpleType", "aae", "Arbëreshë Albanian"),
        ]

        fieldFacets.push(...facets);
        await release.facets.addMultiple(facets);

        let test = await qa.facet.test.definition_formatting_specialChars(facets);
        let issues = test.issues;

        expect(test.failed).toBeTruthy();
        expect(issues.length).toBe(2);

        expect(issues[0].label).toBe("genc:CountryAlpha2CodeSimpleType - enum CI");
        expect(issues[0].problemValue).toBe("CÃ”TE Dâ€™IVOIRE");

        expect(issues[1].label).toBe("iso_3166:CountryNumericCodeSimpleType - enum 384");
        expect(issues[1].problemValue).toBe("CÃ”TE Dâ€™IVOIRE");

      });

      test("#definition_missing_code", async () => {

        let facets = [
          new Facet("ext:WeekdayCodeSimpleType", "WED", "Wednesday", "enumeration"),

          // invalid
          new Facet("ext:WeekdayCodeSimpleType", "THU", "", "enumeration"),

          new Facet("ext:LengthSimpleType", "10", "", "maxLength")
        ];

        fieldFacets.push(...facets);

        let test = await qa.facet.test.definition_missing_code(facets);

        expect(test.failed).toBeTruthy();
        expect(test.issues[0].label).toBe("ext:WeekdayCodeSimpleType - enum THU");
        expect(test.issues.length).toBe(1);
      });

      test("#definition_missing_pattern", async () => {

        let facets = [
          new Facet("ext:TelephoneNumberFormatType", "\d{3}-\d{3}-\d{4}", "Telephone number format ###-###-####", "pattern"),

          // invalid
          new Facet("ext:SSNFormatType", "\d{9}", "", "pattern"),

          new Facet("ext:LengthSimpleType", "10", "", "maxLength")
        ];

        fieldFacets.push(...facets);

        let test = await qa.facet.test.definition_missing_pattern(facets);

        expect(test.failed).toBeTruthy();
        expect(test.issues[0].label).toBe("ext:SSNFormatType - pattern \d{9}");
        expect(test.issues.length).toBe(1);
      });

      test("#style_invalid", async () => {

        let facets = [
          new Facet("ext:WeekdayCodeSimpleType", "WED", "", "enumeration"),
          new Facet("ext:WeekdayCodeSimpleType", "THU", "", "ENUM"), // invalid
          new Facet("ext:WeekdayCodeSimpleType", "FRI", "", "code"), // invalid
          new Facet("ext:WeekdayCodeSimpleType", "SAT"), // 'enumeration' added as default
          new Facet("ext:LengthSimpleType", "10", "", "maxLength")
        ];

        fieldFacets.push(...facets);

        let test = await qa.facet.test.style_invalid(facets);

        expect(test.failed).toBeTruthy();
        expect(test.issues[0].label).toBe("ext:WeekdayCodeSimpleType - ENUM THU");
        expect(test.issues[0].problemValue).toBe("ENUM");

        expect(test.issues[1].label).toBe("ext:WeekdayCodeSimpleType - code FRI");
        expect(test.issues[1].problemValue).toBe("code");
        expect(test.issues.length).toBe(2);
      });

      test("#type_complex", async () => {

        let facets = [
          new Facet("ext:WeekdayCodeSimpleType", "MON"),
          new Facet("nc:PersonType", "MON") // invalid
        ];

        fieldFacets.push(...facets);

        await release.types.add("ext", "WeekdayCodeSimpleType", "", "simple");
        // await release.types.add("nc", "PersonType", "", "object");

        let test = await qa.facet.test.type_complex(facets, release);

        expect(test.failed).toBeTruthy();
        expect(test.issues[0].label).toBe("nc:PersonType - enum MON");
        expect(test.issues[0].problemValue).toBe("nc:PersonType");
        expect(test.issues.length).toBe(1);
      });

      test("#type_repTerm_code", async () => {

        let facets = [
          new Facet("ext:WeekdayCodeSimpleType", "MON", "", "enumeration"),
          new Facet("ext:WeekdaySimpleType", "TUE", "", "enumeration"), // invalid
          new Facet("ext:LengthSimpleType", "10", "", "length")
        ];

        fieldFacets.push(...facets);

        let test = await qa.facet.test.type_repTerm_code(facets, release);

        expect(test.failed).toBeTruthy();
        expect(test.issues[0].label).toBe("ext:WeekdaySimpleType - enum TUE");
        expect(test.issues[0].problemValue).toBe("ext:WeekdaySimpleType");
        expect(test.issues.length).toBe(1);
      });

      test("#type_unknown", async () => {

        let facets = [
          new Facet("ext:BogusCodeSimpleType", "X"), // invalid
          new Facet("nc:BogusCodeSimpleType", "Y"), // invalid
          new Facet("ext:WeekdayCodeSimpleType", "MON"),
          new Facet(null, "MON")
        ];

        fieldFacets.push(...facets);

        // (type added above)
        // release.types.add("ext", "WeekdayCodeSimpleType", "", "simple");

        let test = await qa.facet.test.type_unknown(facets, release);

        expect(test.failed).toBeTruthy();
        expect(test.issues[0].label).toBe("ext:BogusCodeSimpleType - enum X");
        expect(test.issues[0].problemValue).toBe("ext:BogusCodeSimpleType");

        expect(test.issues[1].label).toBe("nc:BogusCodeSimpleType - enum Y");
        expect(test.issues[1].problemValue).toBe("nc:BogusCodeSimpleType");

        expect(test.issues[2].label).toBe("null - enum MON");
        expect(test.issues[2].problemValue).toBe(null);
        expect(test.issues.length).toBe(3);
      });

      test("#facet_value_duplicate_code", async () => {

        let facets = [
          new Facet("ext:WeekdayCodeSimpleType", "MON"), // invalid
          new Facet("ext:WeekdayCodeSimpleType", "MON"), // invalid
          new Facet("ext:WeekdayCodeSimpleType", "TUE"),
          new Facet("nc:WeekdayCodeSimpleType", "TUE"),
          new Facet(null, "TUE")
        ];

        fieldFacets.push(...facets);

        let test = await qa.facet.test.value_duplicate_code(facets, release);

        expect(test.failed).toBeTruthy();
        expect(test.issues[0].label).toBe("ext:WeekdayCodeSimpleType - enum MON");
        expect(test.issues[0].problemValue).toBe("MON");

        expect(test.issues[1].label).toBe("ext:WeekdayCodeSimpleType - enum MON");
        expect(test.issues[1].problemValue).toBe("MON");
        expect(test.issues.length).toBe(2);
      });

      test("#facet_value_missing", async () => {

        let facets = [
          new Facet("ext:WeekdayCodeSimpleType", "MON"),
          new Facet("a:WeekdayCodeSimpleType"), // invalid
          new Facet("b:WeekdayCodeSimpleType", null), // invalid
          new Facet("c:WeekdayCodeSimpleType", "") // invalid
        ];

        fieldFacets.push(...facets);

        let test = await qa.facet.test.value_missing(facets);

        expect(test.failed).toBeTruthy();
        expect(test.issues[0].label).toBe("a:WeekdayCodeSimpleType - enum undefined");
        expect(test.issues[1].label).toBe("b:WeekdayCodeSimpleType - enum null");
        expect(test.issues[2].label).toBe("c:WeekdayCodeSimpleType - enum ");
        expect(test.issues.length).toBe(3);
      });

    });

    describe("Facet field tests", () => {

      /** @type {FieldTest} */
      let fieldTest;

      beforeAll( async () => {
        fieldTest = new FieldTest(qa.facet, fieldFacets, release);
      });

      test("#individual fields", async () => {
        let fields = Object.getOwnPropertyNames( qa.facet.field );
        for (let field of fields) {
          await fieldTest.run(field);
        }
      });

      test("#all fields", async () => {
        let results = await qa.facet.all(fieldFacets, release);
        expect(fieldTest.fieldTestCount).toBe(results.tests.length);
      });

    });

  });

}

module.exports = facetTests;

let NIEMModelQA = require("../../src/index");
