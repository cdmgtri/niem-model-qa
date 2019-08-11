
let NIEMModelQA = require("../../src/index");

let NIEM = require("niem-model-source");
let { Release, Namespace, Type, Facet, LocalTerm } = NIEM.ModelObjects;

/** @type {Release} */
let release;

/** @type {Type[]} */
let fieldTypes = [];

let FieldTest = require("./field");

/**
 * @param {NIEMModelQA} qa
 * @param {NIEM} niem
 */
function typeTests(qa, niem) {

  describe("Type", () => {

    beforeAll( async () => {
      release = (await niem.releases.find())[0];
    });

    describe("Type unit tests", () => {

      test("#base_invalid_csc", async () => {

        let types = [
          new Type(release, "ext", "IDType", "An ID", "object", "ext:BogusType"),

          // invalid
          new Type(release, "ncic", "HairColorCodeType", null, "CSC", "nc:PersonType"),

          new Type(release, "ncic", "HairColorCodeSimpleType", null, "simple", "xs:token"),
          new Type(release, "nc", "TextType", null, "CSC", "niem-xs:token")
        ];

        fieldTypes.push(...types);

        await release.types.add( new Type(null, "xs", "token", null, "simple") );
        await release.types.add( new Type(null, "niem-xs", "token", null, "CSC") );
        await release.types.add( new Type(null, "nc", "PersonType", null, "object") );

        let test = await qa.type.test.base_invalid_csc(types, release);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ncic:HairColorCodeType");
        expect(test.issues()[0].problemValue).toBe("nc:PersonType");
        expect(test.issues().length).toBe(1);
      });

      test("#base_invalid_simple", async () => {

        let types = [
          new Type(release, "ext", "IDType", "An ID", "object", "ext:BogusType"),

          // invalid
          new Type(release, "ncic", "HairColorCodeSimpleType", null, "simple", "ncic:EyeColorCodeSimpleType"),

          new Type(release, "ncic", "EyeColorCodeSimpleType", null, "simple", "xs:token")
        ];

        fieldTypes.push(...types);

        await release.types.add( new Type(null, "ncic", "EyeColorCodeSimpleType", null, "simple") );

        let test = await qa.type.test.base_invalid_simple(types, release);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ncic:HairColorCodeSimpleType");
        expect(test.issues()[0].problemValue).toBe("ncic:EyeColorCodeSimpleType");
        expect(test.issues().length).toBe(1);
      });

      test("#base_missing_simpleContent", async () => {

        let types = [
          new Type(release, "ext", "IDType", "An ID", "object"),
          new Type(release, "ncic", "HairColorCodeType", null, "CSC"), // invalid
          new Type(release, "ncic", "HairColorCodeSimpleType", null, "simple"), // invalid
          new Type(release, "nc", "TextType", null, "CSC", "niem-xs:token")
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.base_missing_simpleContent(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ncic:HairColorCodeType");
        expect(test.issues()[1].label).toBe("ncic:HairColorCodeSimpleType");
        expect(test.issues().length).toBe(2);
      });

      test("#base_unknown", async () => {

        let types = [
          new Type(release, "ext", "IDType", "An ID", "object"),
          new Type(release, "nc", "TextType", null, "CSC", "niem-xs:token"),

          // invalid
          new Type(release, "nc", "LocationType", null, "object", "structures:BogusType")
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.base_unknown(types, release);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("nc:LocationType");
        expect(test.issues().length).toBe(1);
      });

      test("#definition_missing_complex", async () => {

        let types = [
          new Type(release, "ext", "IDType", "An ID", "object"),
          new Type(release, "nc", "PersonType", null, "object"), // invalid
          new Type(release, "xs", "string", null, "simple")
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.definition_missing_simple(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("xs:string");
        expect(test.issues().length).toBe(1);
      });

      test("#definition_missing_simple", async () => {

        let types = [
          new Type(release, "ext", "IDSimpleType", "An ID", "simple"),
          new Type(release, "nc", "PersonType", null, "object"),
          new Type(release, "xs", "string", null, "simple") // invalid
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.definition_missing_simple(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("xs:string");
        expect(test.issues().length).toBe(1);
      });

      test("#definition_phrase_complex", async () => {

        let types = [
          new Type(release, "ext", "IDType", "A data type for an ID", "object"),
          new Type(release, "nc", "PersonType", "A person", "object"), // invalid
          new Type(release, "xs", "string", "A string", "simple")
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.definition_phrase_complex(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("nc:PersonType");
        expect(test.issues().length).toBe(1);
      });

      test("#definition_phrase_simple", async () => {

        let types = [
          new Type(release, "ext", "IDSimpleType", "An ID", "simple"), // invalid
          new Type(release, "nc", "PersonType", "A person", "object"),
          new Type(release, "xs", "string", "A data type for a string", "simple")
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.definition_phrase_simple(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ext:IDSimpleType");
        expect(test.issues().length).toBe(1);
      });

      test("#definition_spellcheck", async () => {

        let types = [
          new Type(release, "ext", "IDSimpleType", "An ID", "simple"),

          // invalid
          new Type(release, "nc", "PersonType", "A persom or a hooman being.", "object"),

          new Type(release, "ncic", "VMOCodeType", "A data type for VMO codes", "simple")
        ];

        let localTerm = new LocalTerm(release, "ncic", "VMO", "vehicle model");
        await release.localTerms.add(localTerm);

        fieldTypes.push(...types);

        let test = await qa.type.test.definition_spellcheck(types, release);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("nc:PersonType");
        expect(test.issues()[0].problemValue).toBe("persom");

        expect(test.issues()[1].label).toBe("nc:PersonType");
        expect(test.issues()[1].problemValue).toBe("hooman");
        expect(test.issues().length).toBe(2);
      });

      test("#name_camelCase", async () => {

        let types = [
          new Type(release, "ext", "string"), // invalid
          new Type(release, "ext", "LocationType"),
          new Type(release, "xs", "string"),
          new Type(release, "niem-xs", "string")
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.name_camelCase(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ext:string");
        expect(test.issues().length).toBe(1);
      });

      test("#name_duplicate", async () => {

        let types = [
          new Type(release, "ext", "LocationType"), // invalid
          new Type(release, "ext", "LocationType"), // invalid
          new Type(release, "nc", "LocationType"),
          new Type(release, "nc", "PersonType")
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.name_duplicate(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ext:LocationType");
        expect(test.issues()[1].label).toBe("ext:LocationType");
        expect(test.issues().length).toBe(2);
      });

      test("#name_inconsistent_codeType", async () => {

        let types = [
          new Type(release, "ext", "EyeColorCodeType", null, "CSC", "ext:EyeColorCodeSimpleType"),
          new Type(release, "ext", "HairColorCodeType", null, "CSC", "ext:EyeColorCodeSimpleType"), // invalid
          new Type(release, "ext", "TextType", null, "CSC", "xs:string")
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.name_inconsistent_codeType(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].problemValue).toBe("HairColorCodeType");
        expect(test.issues().length).toBe(1);
      });

      /**
       * Checks type names for invalid characters.
       */
      test("#name_invalidChar", async () => {

        let types = [
          new Type(release, "ext", "NameType"),
          new Type(release, "ext", "CarType "), // invalid
          new Type(release, "ext", "ID#") // invalid
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.name_invalidChar(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].problemValue).toBe("CarType ");
        expect(test.issues()[1].problemValue).toBe("ID#");
        expect(test.issues().length).toBe(2);
      });

      /**
       * Checks simple types for missing names.
       */
      test("#name_missing_simple", async () => {

        let types = [
          new Type(release, "ext", "NameType", "", "simple"),
          new Type(release, "ext", "", null , "simple"), // invalid
          new Type(release, "ext", "", null, "association"),
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.name_missing_simple(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues().length).toBe(1);

      });

      /**
       * Checks complex types for missing names.
       */
      test("#name_missing_complex", async () => {

        let types = [
          new Type(release, "ext", "NameType", "", "object"),
          new Type(release, "ext", "", null, "association"), // invalid
          new Type(release, "ext", "", null , "simple")
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.name_missing_complex(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues().length).toBe(1);
      });

      test("#name_repTerm_type", async () => {

        let types = [
          new Type(release, "ext", "NameType"),
          new Type(release, "ext", "Car_type "), // invalid
          new Type(release, "ext", "ID#") // invalid
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.name_repTerm_type(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].problemValue).toBe("Car_type ");
        expect(test.issues()[1].problemValue).toBe("ID#");
        expect(test.issues().length).toBe(2);
      });

      test("#name_repTerm_simple", async () => {

        let types = [
          new Type(release, "ext", "NameSimpleType", null, "object"),
          new Type(release, "xs", "token", null, "simple"),
          new Type(release, "ext", "CarType", null, "simple"), // invalid
          new Type(release, "ext", "IDsimpleType", null, "simple"), // invalid
          new Type(release, "ext", "weekdaySimpleType", null, "simple")
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.name_repTerm_simple(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].problemValue).toBe("CarType");
        expect(test.issues()[1].problemValue).toBe("IDsimpleType");
        expect(test.issues().length).toBe(2);
      });

      test("#name_repTerm_complex", async () => {

        let types = [
          new Type(release, "ext", "NameSimpleType", null, "simple"),
          new Type(release, "ext", "CarSimpleType", null, "object"), // invalid
          new Type(release, "ext", "IDSimpleType", null, "simple")
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.name_repTerm_complex(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].problemValue).toBe("CarSimpleType");
        expect(test.issues().length).toBe(1);
      });

      test("#name_repTerm_codeType", async () => {

        let types = [
          new Type(release, "ext", "IDCodeType", null, "CSC", "ext:IDCodeSimpleType"),
          new Type(release, "ext", "MonthCodeType", null, "CSC", "xs:string"), // invalid
          new Type(release, "ext", "TextType", null, "CSC", "xs:string")
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.name_repTerm_codeType(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].problemValue).toBe("MonthCodeType");
        expect(test.issues().length).toBe(1);
      });

      test("#name_repTerm_codeSimpleType", async () => {

        let types = [
          new Type(release, "ext", "WeekdayCodeSimpleType", null, "simple", "xs:token"),

          // invalid (CodeSimpleType name; no facets)
          new Type(release, "ext", "MonthCodeSimpleType", null, "simple", "xs:string"),

          new Type(release, "ext", "TextType", null, "CSC", "xs:string")
        ];

        await types[0].facets.add( new Facet(null, null, "MON") );
        await types[0].facets.add( new Facet(null, null, "TUE") );
        await types[0].facets.add( new Facet(null, null, "WED") );

        fieldTypes.push(...types);

        let test = await qa.type.test.name_repTerm_codeSimpleType(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].problemValue).toBe("MonthCodeSimpleType");
        expect(test.issues().length).toBe(1);
      });

      test("#name_reservedTerm_type", async () => {

        let types = [
          new Type(release, "ext", "IDTypeCodeType"), // invalid
          new Type(release, "ext", "TypeCodeType"), // invalid
          new Type(release, "nc", "LocationType")
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.name_reservedTerm_type(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ext:IDTypeCodeType");
        expect(test.issues()[1].label).toBe("ext:TypeCodeType");
        expect(test.issues().length).toBe(2);
      });

      test("#name_spellcheck", async () => {

        let types = [
          new Type(release, "ext", "OrganizatoinType"), // invalid
          new Type(release, "nc", "DestinationLocationzType"), // invalid
          new Type(release, "nc", "NIEMCountryCodeType"),
          new Type(release, "ext", "NIEMCountryCodeType"), // invalid
          new Type(release, "nc", "PersonType")
        ];

        let term = new LocalTerm(null, "nc", "NIEM", "National Information Exchange Model");
        await release.localTerms.add(term);

        fieldTypes.push(...types);

        let test = await qa.type.test.name_spellcheck(types, release);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ext:OrganizatoinType");
        expect(test.issues()[0].problemValue).toBe("Organizatoin");

        expect(test.issues()[1].label).toBe("nc:DestinationLocationzType");
        expect(test.issues()[1].problemValue).toBe("Locationz");

        expect(test.issues()[2].label).toBe("ext:NIEMCountryCodeType");
        expect(test.issues()[2].problemValue).toBe("NIEM");
        expect(test.issues().length).toBe(3);
      });

      test("#prefix_missing", async () => {

        let types = [
          new Type(release, null, "IDTypeCodeType"), // invalid
          new Type(release, "", "TypeCodeType"), // invalid
          new Type(release, "nc", "LocationType")
        ];

        fieldTypes.push(...types);

        let test = await qa.type.test.prefix_missing(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("null:IDTypeCodeType");
        expect(test.issues()[1].label).toBe(":TypeCodeType");
        expect(test.issues().length).toBe(2);
      });

      test("#prefix_unknown", async () => {

        let types = [
          new Type(release, "ext", "IDTypeCodeType"), // invalid
          new Type(release, "", "TypeCodeType"),
          new Type(release, "nc", "LocationType")
        ];

        fieldTypes.push(...types);

        await release.namespaces.add( new Namespace(release, "nc") );

        let test = await qa.type.test.prefix_unknown(types, release);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ext:IDTypeCodeType");
        expect(test.issues()[0].problemValue).toBe("ext");
        expect(test.issues().length).toBe(1);
      });

      test("#style_missing", async () => {

        let types = [
          new Type(release, "ext", "IDTypeCodeType"), // invalid
          new Type(release, "ext", "TypeCodeType", null, "object"),
          new Type(release, "nc", "LocationType", null, "simple")
        ];

        let test = await qa.type.test.style_missing(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ext:IDTypeCodeType");
        expect(test.issues().length).toBe(1);
      });

      test("#style_unknown", async () => {

        let types = [
          new Type(release, "ext", "IDTypeCodeType", null, "CSC"),
          new Type(release, "nc", "LocationType", null, "object"),
          new Type(release, "nc", "LocationType", null, "bogus"), // invalid
          new Type(release, "nc", "ActivityType", null) // invalid
        ];

        let test = await qa.type.test.style_unknown(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("nc:LocationType");
        expect(test.issues()[0].problemValue).toBe("bogus");

        expect(test.issues()[1].label).toBe("nc:ActivityType");
        expect(test.issues()[1].problemValue).toBe(undefined);
        expect(test.issues().length).toBe(2);
      });

    });

    describe("Type field tests", () => {

      /** @type {FieldTest} */
      let fieldTest;

      beforeAll( async () => {
        fieldTest = new FieldTest(qa.type, fieldTypes, release);
      });

      test("#base", async () => {
        await fieldTest.run("base");
      });

      test("#definition", async () => {
        await fieldTest.run("definition");
      });

      test("#name", async () => {
        await fieldTest.run("name");
      });

      test("#prefix", async () => {
        await fieldTest.run("prefix");
      });

      test("#style", async () => {
        await fieldTest.run("style");
      });

      test("#all fields", async () => {
        let testSuite = await fieldTest.run();
        expect(testSuite.tests.length).toBe(fieldTest.fieldTestCount);
      });

    });

  });

}


module.exports = typeTests;
