
let { NIEM, Release, Property } = require("niem-model");

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

      test("#definition_formatting", async () => {

        let properties = [
          new Property("x", "Name1", "A definition with valid formatting.  This should pass."),

          // Invalid properties below
          new Property("x", "Name2", "This definition has  double spaces in the middle."),
          new Property("x", "Name3", "This definition has triple spaces after the period.   This should fail."),
          new Property("x", "Name4", " This definition has a leading space."),
          new Property("x", "Name5", "This definition has a trailing space. "),
          new Property("x", "Name6", "This definition has a non-breaking space:  ."),
        ]

        fieldProperties.push(...properties);

        let test = await qa.objects.property.test.definition_formatting(properties);
        let issues = test.issues;

        expect(issues.length).toBe(5);

        expect(issues[0].label).toBe("x:Name2");
        expect(issues[1].label).toBe("x:Name3");
        expect(issues[2].label).toBe("x:Name4");
        expect(issues[3].label).toBe("x:Name5");
        expect(issues[4].label).toBe("x:Name6");
        expect(issues[4].comments).toBe("Non-breaking space detected: This definition has a non-breaking space: --> <--.");
      });

      test("#definition_spellcheck", async () => {

        let properties = [
          new Property("ext", "ID", "An identifer"),  // invalid
          new Property("nc", "Person", "A persom or a hooman being."),  // invalid
          new Property("nc", "CountryISOCode", "An ISO country code")
        ];

        await release.localTerms.add("nc", "ISO", "International Organization for Standardization");

        fieldProperties.push(...properties);

        let test = await qa.objects.property.test.definition_spellcheck(properties, release);
        let issues = test.issues;

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

        let test = await qa.objects.property.test.name_camelCase_attribute(properties);

        expect(test.failed).toBeTruthy();
        expect(test.issues[0].label).toBe("ext:SequenceID");
        expect(test.issues.length).toBe(1);
      });

      test("#name_camelCase_element", async () => {

        let properties = [
          Property.createAttribute(release, "ext", "sequenceID"),
          Property.createElement(release, "ext", "person"), // invalid
          Property.createElement(release, "nc", "Person")
        ];

        fieldProperties.push(...properties);

        let test = await qa.objects.property.test.name_camelCase_element(properties);

        expect(test.failed).toBeTruthy();
        expect(test.issues[0].label).toBe("ext:person");
        expect(test.issues.length).toBe(1);
      });

      test("#name_duplicate", async () => {

        let properties = [
          new Property("ext", "Location"), // invalid
          new Property("ext", "Location"), // invalid
          new Property("nc", "Location"),
          new Property("ext", "LocationCode")
        ];

        fieldProperties.push(...properties);

        let test = await qa.objects.property.test.name_duplicate(properties);
        let issues = test.issues;

        expect(test.failed).toBeTruthy();
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

        let test = await qa.objects.property.test.name_invalidChar(properties);
        let issues = test.issues;

        expect(test.failed).toBeTruthy();
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

        let test = await qa.objects.property.test.name_missing(properties);

        expect(test.failed).toBeTruthy();
        expect(test.issues.length).toBe(2);

      });

      test("#name_repTerm_aug", async () => {

        let properties = [
          new Property("ext", "PersonAugmentation", "", "", "nc:PersonAugmentationPoint"),
          new Property("ext", "GeospatialLocationAugmentation", "", "", "nc:LocationAugmentationPoint")
        ];

        fieldProperties.push(...properties);

        let test = await qa.objects.property.test.name_repTerm_aug(properties);

        expect(test.failed).toBeTruthy();
        expect(test.issues.length).toBe(1);
        expect(test.issues[0].label).toBe("ext:GeospatialLocationAugmentation");

      });

      test("#name_spellcheck", async () => {

        let properties = [
          new Property("ext", "BiometricID"),
          new Property("ext", "Organizatoin"), // invalid
          new Property("ext", "OrgName"), // invalid
          new Property("ext", "XYZCountryCode"), // invalid
          new Property("nc", "DestinationLocationz"), // invalid
          new Property("nc", "XYZCountryCode"),
          new Property("nc", "Person")
        ];

        await release.localTerms.add("nc", "XYZ", "An acronym for XYZ");

        // Customize the dictionary
        await qa.spellChecker.addWords(["Biometric"]);
        await qa.spellChecker.removeWords(["Org", "Doc"]);

        fieldProperties.push(...properties);

        let test = await qa.objects.property.test.name_spellcheck(properties, release);
        let issues = test.issues;

        expect(test.failed).toBeTruthy();
        expect(issues.length).toBe(4);

        expect(issues[0].label).toBe("ext:Organizatoin");
        expect(issues[0].problemValue).toBe("Organizatoin");

        expect(issues[1].label).toBe("ext:OrgName");
        expect(issues[1].problemValue).toBe("Org");

        expect(issues[2].label).toBe("ext:XYZCountryCode");
        expect(issues[2].problemValue).toBe("XYZ");

        expect(issues[3].label).toBe("nc:DestinationLocationz");
        expect(issues[3].problemValue).toBe("Locationz");

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

        let test = await qa.objects.property.test.prefix_missing(properties, release);
        let issues = test.issues;

        expect(test.failed).toBeTruthy();
        expect(issues.length).toBe(3);
        expect(issues[0].label).toBe("null:B");
        expect(issues[1].label).toBe(":C");
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

        let test = await qa.objects.property.test.prefix_unknown(properties, release);
        let issues = test.issues;

        expect(test.failed).toBeTruthy();
        expect(issues.length).toBe(1);
      });

    });

    describe("Property field tests", () => {

      /** @type {FieldTest} */
      let fieldTest;

      beforeAll( async () => {
        fieldTest = new FieldTest(qa.objects.property, fieldProperties, release);
      });

      test("#individual fields", async () => {
        let fields = Object.getOwnPropertyNames( qa.objects.property.field );
        for (let field of fields) {
          await fieldTest.run(field);
        }
      });

      test("#all fields", async () => {
        let propertyQA = await qa.objects.property.run(fieldProperties, release);
        expect(fieldTest.fieldTestCount).toBe(propertyQA.tests.length);
      });

    });

  });


}

module.exports = propertyTests;

let NIEMModelQA = require("../../src/index");
