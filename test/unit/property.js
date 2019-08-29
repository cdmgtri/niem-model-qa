
let NIEMModelQA = require("../../index");

let NIEM = require("niem-model");
let { Release, Property } = NIEM;

/** @type {Release} */
let release;

/** @type {Property[]} */
let fieldProperties = [];

let FieldTest = require("./field");

/**
 * @param {NIEMModelQA} qa
 * @param {NIEM} niem
 */
function propertyTests(qa, niem) {

  describe("Property", () => {

    beforeAll( async () => {
      release = (await niem.releases.find())[0];
    });

    describe("Property unit tests", () => {

      test("#definition_spellcheck", async () => {

        let properties = [

          // invalid
          new Property("ext", "ID", "An identifer"),

          // invalid
          new Property("nc", "Person", "A persom or a hooman being."),

          new Property("nc", "CountryISOCode", "An ISO country code")
        ];

        await release.localTerms.add("nc", "ISO", "International Organization for Standardization");

        fieldProperties.push(...properties);

        let test = await qa.property.test.definition_spellcheck(properties, release);
        let issues = test.issues();

        expect(issues.length).toBe(3);

        expect(issues[0].label).toBe("ext:ID");
        expect(issues[0].problemValue).toBe("identifer");

        expect(issues[1].label).toBe("nc:Person");
        expect(issues[1].problemValue).toBe("persom");

        expect(issues[2].label).toBe("nc:Person");
        expect(issues[2].problemValue).toBe("hooman");
      });

      test("#name_camelCase_attribute", async () => {

        let properties = [
          Property.createAttribute(release, "ext", "SequenceID"), // invalid
          Property.createAttribute(release, "ext", "unitCode"),
          Property.createElement(release, "nc", "Person")
        ];

        fieldProperties.push(...properties);

        let test = await qa.property.test.name_camelCase_attribute(properties);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ext:SequenceID");
        expect(test.issues().length).toBe(1);
      });

      test("#name_camelCase_element", async () => {

        let properties = [
          Property.createAttribute(release, "ext", "sequenceID"),
          Property.createElement(release, "ext", "person"), // invalid
          Property.createElement(release, "nc", "Person")
        ];

        fieldProperties.push(...properties);

        let test = await qa.property.test.name_camelCase_element(properties);

        expect(test.failed()).toBeTruthy();
        expect(test.issues()[0].label).toBe("ext:person");
        expect(test.issues().length).toBe(1);
      });

      test("#name_duplicate", async () => {

        let properties = [
          new Property("ext", "Location"), // invalid
          new Property("ext", "Location"), // invalid
          new Property("nc", "Location"),
          new Property("ext", "LocationCode")
        ];

        fieldProperties.push(...properties);

        let test = await qa.property.test.name_duplicate(properties);
        let issues = test.issues();

        expect(test.failed()).toBeTruthy();
        expect(issues.length).toBe(2);
        expect(issues[0].label).toBe("ext:Location");
        expect(issues[1].label).toBe("ext:Location");

      });

      /**
       * Checks type names for invalid characters.
       */
      test("#name_invalidChar", async () => {

        let properties = [
          new Property("ext", "Name"),
          new Property("ext", "Car "), // invalid
          new Property("ext", "ID#") // invalid
        ];

        fieldProperties.push(...properties);

        let test = await qa.property.test.name_invalidChar(properties);
        let issues = test.issues();

        expect(test.failed()).toBeTruthy();
        expect(issues.length).toBe(2);
        expect(issues[0].problemValue).toBe("Car ");
        expect(issues[1].problemValue).toBe("ID#");
      });


      /**
       * Checks properties for missing names.
       */
      test("#name_missing", async () => {

        let properties = [
          new Property("ext", "NameType"),
          new Property("ext", ""), // invalid
          new Property("ext", null), // invalid
        ];

        fieldProperties.push(...properties);

        let test = await qa.property.test.name_missing(properties);

        expect(test.failed()).toBeTruthy();
        expect(test.issues().length).toBe(2);

      });

      test("#name_spellcheck", async () => {

        let properties = [
          new Property("ext", "Organizatoin"), // invalid
          new Property("nc", "DestinationLocationz"), // invalid
          new Property("nc", "NIEMCountryCode"),
          new Property("ext", "NIEMCountryCode"), // invalid
          new Property("nc", "Person")
        ];

        await release.localTerms.add("nc", "NIEM", "National Information Exchange Model");

        fieldProperties.push(...properties);

        let test = await qa.property.test.name_spellcheck(properties, release);
        let issues = test.issues();

        expect(test.failed()).toBeTruthy();
        expect(issues.length).toBe(3);

        expect(issues[0].label).toBe("ext:Organizatoin");
        expect(issues[0].problemValue).toBe("Organizatoin");

        expect(issues[1].label).toBe("nc:DestinationLocationz");
        expect(issues[1].problemValue).toBe("Locationz");

        expect(issues[2].label).toBe("ext:NIEMCountryCode");
        expect(issues[2].problemValue).toBe("NIEM");
      });

      test("#prefix_missing", async () => {

        let properties = [
          new Property("ext", "A"),
          new Property(null, "B"), // invalid
          new Property(undefined, "C"), // invalid
          new Property("", "D"), // invalid
          new Property("nc", "E")
        ];

        fieldProperties.push(...properties);

        let test = await qa.property.test.prefix_missing(properties, release);
        let issues = test.issues();

        expect(test.failed()).toBeTruthy();
        expect(issues.length).toBe(3);
        expect(issues[0].label).toBe("null:B");
        expect(issues[1].label).toBe("undefined:C");
        expect(issues[2].label).toBe(":D");
      });

      test("#prefix_unknown", async () => {

        let properties = [
          new Property("ext", "A"), // invalid
          new Property(null, "B"),
          new Property(undefined, "C"),
          new Property("", "D"),
          new Property("nc", "E")
        ];

        fieldProperties.push(...properties);

        await release.namespaces.add("nc", "core");

        let test = await qa.property.test.prefix_unknown(properties, release);
        let issues = test.issues();

        expect(test.failed()).toBeTruthy();
        expect(issues.length).toBe(1);
      });

    });

    describe("Property field tests", () => {

      /** @type {FieldTest} */
      let fieldTest;

      beforeAll( async () => {
        fieldTest = new FieldTest(qa.property, fieldProperties, release);
      });

      test("#individual fields", async () => {
        let fields = Object.getOwnPropertyNames( qa.property.field );
        for (let field of fields) {
          await fieldTest.run(field);
        }
      });

      test("#all fields", async () => {
        let testSuite = await qa.property.all(fieldProperties, release);
        expect(fieldTest.fieldTestCount).toBe(testSuite.tests.length);
      });

    });

  });


}

module.exports = propertyTests;
