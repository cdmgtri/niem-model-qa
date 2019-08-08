
let NIEMModelQA = require("../../src/index");

let NIEM = require("niem-model-objects");
let { Release, Type } = NIEM;


let cscType = new Type(null, "usps", "StateCodeType", "A data type for a state code.", "", "usps:StateCodeSimpleType");

let simpleType = new Type(null, "usps", "StateCodeType", "A data type for a state code.", "", "usps:StateCodeSimpleType");

/** @type {Type[]} */
let nameTypes = [];

/**
 * @param {NIEMModelQA} qa
 * @param {Release} release
 */
function typeTests(qa, release) {

  describe("Type local tests", () => {

    describe("Unit tests", () => {

      /**
       * Checks simple types for missing names.
       */
      test("#name_missing_simple", () => {

        let types = [
          new Type(release, "ext", "NameType", "", "simple"),
          new Type(release, "ext", "", null , "simple"), // invalid
          new Type(release, "ext", "", null, "association"),
        ];

        nameTypes.push(...types);

        let test = qa.type.test.name_missing_simple(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues().length).toBe(1);

      });

      /**
       * Checks complex types for missing names.
       */
      test("#name_missing_complex", () => {

        let types = [
          new Type(release, "ext", "NameType", "", "object"),
          new Type(release, "ext", "", null, "association"), // invalid
          new Type(release, "ext", "", null , "simple")
        ];

        nameTypes.push(...types);

        let test = qa.type.test.name_missing_complex(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues().length).toBe(1);
      });

      /**
       * Checks type names for invalid characters.
       */
      test("#name_invalidChar", () => {

        let types = [
          new Type(release, "ext", "NameType"),
          new Type(release, "ext", "CarType "), // invalid
          new Type(release, "ext", "ID#") // invalid
        ];

        nameTypes.push(...types);

        let test = qa.type.test.name_invalidChar(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].problemValue).toBe("CarType ");
        expect(test.issues()[1].problemValue).toBe("ID#");
        expect(test.issues().length).toBe(2);
      });

      test("#name_repTerm_type", () => {

        let types = [
          new Type(release, "ext", "NameType"),
          new Type(release, "ext", "Car_type "), // invalid
          new Type(release, "ext", "ID#") // invalid
        ];

        nameTypes.push(...types);

        let test = qa.type.test.name_repTerm_type(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].problemValue).toBe("Car_type ");
        expect(test.issues()[1].problemValue).toBe("ID#");
        expect(test.issues().length).toBe(2);
      });

      test("#name_repTerm_simple", () => {

        let types = [
          new Type(release, "ext", "NameSimpleType", null, "object"),
          new Type(release, "xs", "token", null, "simple"),
          new Type(release, "ext", "CarType", null, "simple"), // invalid
          new Type(release, "ext", "IDsimpleType", null, "simple"), // invalid
          new Type(release, "ext", "weekdaySimpleType", null, "simple")
        ];

        nameTypes.push(...types);

        let test = qa.type.test.name_repTerm_simple(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].problemValue).toBe("CarType");
        expect(test.issues()[1].problemValue).toBe("IDsimpleType");
        expect(test.issues().length).toBe(2);
      });

      test("#name_repTerm_complex", () => {

        let types = [
          new Type(release, "ext", "NameSimpleType", null, "simple"),
          new Type(release, "ext", "CarSimpleType", null, "object"), // invalid
          new Type(release, "ext", "IDSimpleType", null, "simple")
        ];

        nameTypes.push(...types);

        let test = qa.type.test.name_repTerm_complex(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].problemValue).toBe("CarSimpleType");
        expect(test.issues().length).toBe(1);
      });

      test("#name_repTerm_codeType", () => {

        let types = [
          new Type(release, "ext", "IDCodeType", null, "CSC", "ext:IDCodeSimpleType"),
          new Type(release, "ext", "MonthCodeType", null, "CSC", "xs:string"), // invalid
          new Type(release, "ext", "TextType", null, "CSC", "xs:string")
        ];

        nameTypes.push(...types);

        let test = qa.type.test.name_repTerm_codeType(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].problemValue).toBe("MonthCodeType");
        expect(test.issues().length).toBe(1);
      });

      test("#name_inconsistent_codeType", () => {

        let types = [
          new Type(release, "ext", "EyeColorCodeType", null, "CSC", "ext:EyeColorCodeSimpleType"),
          new Type(release, "ext", "HairColorCodeType", null, "CSC", "ext:EyeColorCodeSimpleType"), // invalid
          new Type(release, "ext", "TextType", null, "CSC", "xs:string")
        ];

        nameTypes.push(...types);

        let test = qa.type.test.name_inconsistent_codeType(types);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].problemValue).toBe("HairColorCodeType");
        expect(test.issues().length).toBe(1);
      });

    });

    describe("Field tests", () => {

      test("#name", () => {
        let nameTestSuite = qa.type.field.name(nameTypes);
        expect(nameTestSuite.status()).toBe("fail");
      });

    });

  });

}

module.exports = typeTests;
