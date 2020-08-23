
let NIEMObjectUnitTests = require("../niem-object/unit");
let { Release, LocalTerm } = require("niem-model");
let Test = require("../../test");

class LocalTermUnitTests extends NIEMObjectUnitTests {

  /**
   * Check local term definitions use consistent formatting.
   *
   * @param {LocalTerm[]} localTerms
   */
  definition_formatting(localTerms) {
    let test = this.qa.tests.start("localTerm_definition_formatting");
    return this.utils.text_formatting_helper(test, localTerms, "definition");
  }

  /**
   * Check local term literals use consistent formatting.
   *
   * @param {LocalTerm[]} localTerms
   */
  literal_formatting(localTerms) {
    let test = this.qa.tests.start("localTerm_literal_formatting");
    return this.utils.text_formatting_helper(test, localTerms, "literal");
  }

  /**
   * Check local terminology terms use consistent formatting.
   *
   * @param {LocalTerm[]} localTerms
   */
  term_formatting(localTerms) {
    let test = this.qa.tests.start("localTerm_term_formatting");
    return this.utils.text_formatting_helper(test, localTerms, "term");
  }

  /**
   * Checks for duplicate local terms in a namespace.
   *
   * @param {LocalTerm[]} localTerms
   */
  term_duplicate(localTerms) {

    let test = this.qa.tests.start("localTerm_term_duplicate");

    /** @type {LocalTerm[]} */
    let problems = [];

    for (let currentLocalTerm of localTerms) {
      // Check to see if the current local term appears multiple times in the namespace
      let matches = localTerms.filter( localTerm => localTerm.term == currentLocalTerm.term && localTerm.prefix == currentLocalTerm.prefix);

      if (matches.length > 1) {
        problems.push(currentLocalTerm);
      }
    }

    return this.qa.tests.post(test, problems, "term");

  }

  // /**
  //  * Checks for local terms that are not used in the given namespace
  //  *
  //  * @param {LocalTerm[]} localTerms
  //  * @param {Release} release
  //  */
  // term_unused(localTerms, release) {

  //   let test = this.qa.tests.start("localTerm_term_unused");

  //   let problems = [];

  //   let properties = await release.properties.find();
  //   let types = await release.types.find();

  //   for (let localTerm of localTerms) {
  //   }


  //   return this.qa.tests.post(test, problems, "term");

  // }

}

module.exports = LocalTermUnitTests;
