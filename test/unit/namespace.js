
let { NIEM, Release, Namespace } = require("niem-model");
let NIEMModelQA = require("../../src/index");

/** @type {Release} */
let release;

/** @type {Namespace[]} */
let fieldNamespaces = [];

let FieldTest = require("./field");

/**
 * @param {NIEMModelQA} qa
 * @param {NIEM} niem
 */
function namespaceTests(qa, niem) {

  describe("Namespace", () => {

    beforeAll( async () => {
      release = (await niem.releases.find())[0];
    });

    describe("Namespace unit tests", () => {

      test("#definition_spellcheck", async () => {

        let namespaces = [
          new Namespace("ext1", "core", "", "", "ABC abc Abc namespace"),
          new Namespace("ext2", "domain", "", "", "Justice"),
          new Namespace("ext3", "", "", "", "An extnsion namespace"),  // invalid
          new Namespace("ext4", "", "", "", "A namespace from http://www.example.com"),
          new Namespace("ext5", "", "", "", "A namespace from https://www.example.com"),
          new Namespace("ext6", "", "", "", "A namespace from https://www.example.com extnsion") // invalid
        ];

        await release.localTerms.add("ext1", "ABC", "Alpha Bravo Charlie");
        await qa.spellChecker.addWords(["namespace"]);

        fieldNamespaces.push(...namespaces);

        let test = await qa.objects.namespace.tests.definition_spellcheck(namespaces, release);
        let issues = test.issues;

        expect(issues.length).toBe(2);

        expect(issues[0].label).toBe("ext3");
        expect(issues[0].problemValue).toBe("extnsion");

        expect(issues[1].label).toBe("ext6");
        expect(issues[1].problemValue).toBe("extnsion");

      });

    });

    describe("Namespace field tests", () => {

      /** @type {FieldTest} */
      let fieldTest;

      beforeAll( async () => {
        fieldTest = new FieldTest(qa.objects.namespace, fieldNamespaces, release);
      });

      test("#individual fields", async () => {
        let fields = Object.getOwnPropertyNames(qa.objects.namespace.field);
        for (let field of fields) {
          await fieldTest.run(field);
        }
      });

      test("#all fields", async () => {
        let results = await qa.objects.namespace.run(fieldNamespaces, release);
        expect(fieldTest.fieldTestCount).toBe(results.tests.length);
      });

    });

  });

}

module.exports = namespaceTests;
