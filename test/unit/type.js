
let NIEMModelQA = require("../../src/index");

let NIEM = require("niem-model-source");
let { Release, Type, Facet, LocalTerm } = NIEM.ModelObjects;

/** @type {Release} */
let release;

/** @type {Type[]} */
let nameTypes = [];

/** @type {Type[]} */
let defTypes = [];

/**
 * @param {NIEMModelQA} qa
 * @param {NIEM} niem
 */
function typeTests(qa, niem) {

  describe("Type", () => {

    beforeAll( async () => {
      release = (await niem.releases.find())[0];
    });

    describe("Unit tests", () => {

      test("#def_missing_complex", async () => {

        let types = [
          new Type(release, "ext", "IDType", "An ID", "object"),
          new Type(release, "nc", "PersonType", null, "object"), // invalid
          new Type(release, "xs", "string", null, "simple")
        ];

        defTypes.push(...types);

        let test = await qa.type.test.def_missing_simple(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("xs:string");
        expect(test.issues().length).toBe(1);
      });

      test("#def_missing_simple", async () => {

        let types = [
          new Type(release, "ext", "IDSimpleType", "An ID", "simple"),
          new Type(release, "nc", "PersonType", null, "object"),
          new Type(release, "xs", "string", null, "simple") // invalid
        ];

        defTypes.push(...types);

        let test = await qa.type.test.def_missing_simple(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("xs:string");
        expect(test.issues().length).toBe(1);
      });

      test("#def_phrase_complex", async () => {

        let types = [
          new Type(release, "ext", "IDType", "A data type for an ID", "object"),
          new Type(release, "nc", "PersonType", "A person", "object"), // invalid
          new Type(release, "xs", "string", "A string", "simple")
        ];

        defTypes.push(...types);

        let test = await qa.type.test.def_phrase_complex(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("nc:PersonType");
        expect(test.issues().length).toBe(1);
      });

      test("#def_phrase_simple", async () => {

        let types = [
          new Type(release, "ext", "IDSimpleType", "An ID", "simple"), // invalid
          new Type(release, "nc", "PersonType", "A person", "object"),
          new Type(release, "xs", "string", "A data type for a string", "simple")
        ];

        defTypes.push(...types);

        let test = await qa.type.test.def_phrase_simple(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ext:IDSimpleType");
        expect(test.issues().length).toBe(1);
      });

      test("#def_spellcheck", async () => {

        let types = [
          new Type(release, "ext", "IDSimpleType", "An ID", "simple"),

          // invalid
          new Type(release, "nc", "PersonType", "A persom or a hooman being.", "object"),

          new Type(release, "ncic", "VMOCodeType", "A data type for VMO codes", "simple")
        ];

        let localTerm = new LocalTerm(release, "ncic", "VMO", "vehicle model");
        await release.localTerms.add(localTerm);

        defTypes.push(...types);

        let test = await qa.type.test.def_spellcheck(types, release);

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

        nameTypes.push(...types);

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

        nameTypes.push(...types);

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

        nameTypes.push(...types);

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

        nameTypes.push(...types);

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

        nameTypes.push(...types);

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

        nameTypes.push(...types);

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

        nameTypes.push(...types);

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

        nameTypes.push(...types);

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

        nameTypes.push(...types);

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

        nameTypes.push(...types);

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

        nameTypes.push(...types);

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

        nameTypes.push(...types);

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

        nameTypes.push(...types);

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

    });

    describe("Field tests", () => {

      test("#name", async () => {
        let nameTestSuite = await qa.type.field.name(nameTypes, release);
        expect(nameTestSuite.status()).toBe("fail");

        let nameTestIDs = Object
        .getOwnPropertyNames(Object.getPrototypeOf(qa.type.test))
        .filter( property => property.includes("name") );

        nameTestIDs.forEach( nameTestID => {
          expect(nameTestSuite.find("type_" + nameTestID)).toBeDefined();
        });

      });

      test("#definition", async () => {

        let defTestSuite = await qa.type.field.definition(defTypes, release);
        expect(defTestSuite.status()).toBe("fail");

        let defTestIDs = Object
        .getOwnPropertyNames(Object.getPrototypeOf(qa.type.test))
        .filter( property => property.includes("def") );

        defTestIDs.forEach( defTestID => {
          expect(defTestSuite.find("type_" + defTestID)).toBeDefined();
        });

      });

    });

  });

}

module.exports = typeTests;
