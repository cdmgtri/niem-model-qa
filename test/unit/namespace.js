
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
          new Namespace("ext1", "core", "", "", "NIEM Core"),
          new Namespace("ext2", "domain", "", "", "Justice"),
          new Namespace("ext3", "", "", "", "An extnsion namespace"),  // invalid
          new Namespace("ext4", "", "", "", "A NIEM extension namespace")  // invalid
        ];

        await release.localTerms.add("ext1", "NIEM", "National Information Exchange Model");
        await qa.spellcheckAddWords(["namespace"]);

        fieldNamespaces.push(...namespaces);

        let test = await qa.namespace.test.definition_spellcheck(namespaces, release);
        let issues = test.issues;

        expect(issues.length).toBe(2);

        expect(issues[0].label).toBe("ext3");
        expect(issues[0].problemValue).toBe("extnsion");

        expect(issues[1].label).toBe("ext4");
        expect(issues[1].problemValue).toBe("NIEM");

      });

    });

    describe("Namespace field tests", () => {

      /** @type {FieldTest} */
      let fieldTest;

      beforeAll( async () => {
        fieldTest = new FieldTest(qa.namespace, fieldNamespaces, release);
      });

      test("#individual fields", async () => {
        let fields = Object.getOwnPropertyNames(qa.namespace.field);
        for (let field of fields) {
          await fieldTest.run(field);
        }
      });

      test("#all fields", async () => {
        let testSuite = await qa.namespace.all(fieldNamespaces, release);
        expect(fieldTest.fieldTestCount).toBe(testSuite.tests.length);
      });

    });

  });

}

module.exports = namespaceTests;