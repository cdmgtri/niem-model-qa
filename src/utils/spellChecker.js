
let HunspellSpellchecker = require("hunspell-spellchecker");

let { Release } = require("niem-model");

/** @type {{allow: string[], exclude: string[], special: string[]}} */
let customDictionary = require("../../customDictionary.json");


class SpellChecker {

  constructor() {

    let dict_en = require("./dictionary-en.json");

    this.dictionary = new HunspellSpellchecker();
    this.dictionary.use(dict_en);

    /**
     * Terms from component names that do not break down appropriately from standard camel casing rules
     * and should be allowed.
     */
    this.specialTerms = customDictionary.special;

    /**
     * Terms that not appear in the library dictionary but appear in other common dictionaries,
     * like OED.  These should be allowed.
     */
    this.allowedTerms = customDictionary.allow;

    /**
     * Terms that are permitted from the library dictionary but NIEM does not allow, like 'Org'
     * as an abbreviation for 'Organization'.
     */
    this.excludedTerms = customDictionary.exclude;

    /**
     * Definitions, especially for augmentation points, sometimes use NIEM namespace prefixes and
     * component names.  These should be allowed.
     */
    this.niemNames = [];

  }

  /**
   * Check against dictionary and given local terms
   * @param {string} word
   * @param {string[]} terms
   * @param {Boolean} isDefinitionCheck
   */
  async checkWord(word, terms, isDefinitionCheck = false) {

    if (this.excludedTerms.includes(word)) {
      // Reject words that are in the excluded list (e.g. "Org")
      return false;
    }

    // if (word == "extnsion") debugger;

    let passed = this.dictionary.checkExact(word.toLowerCase());
    if (passed) return true;

    // Check the pre-approved list of allowed terms plus the given list of local terminology terms
    passed = this.allowedTerms.concat(terms).includes(word);
    if (passed) return true;

    // Check to see if the word is one of the various special exceptions
    if (isDefinitionCheck) {
      passed = this.niemNames.includes(word);
    }

    return passed;

  }

  /**
   * @param {string} definition
   * @param {string[]} terms
   *
   * @returns {Promise<Array.<{word: string, suggestions: string[], positions: Array.<{from: number, to: number, length: number}>}>>}
   */
  async checkDefinition(definition, terms) {

    let unknownSpellings = [];

    // Remove URLs / prepare definition field and split into words by whitespace
    let processedDefinition = processDefinition(definition);
    let words = processedDefinition.split(/\s+/);

    for (let word of words) {
      let correct = await this.checkWord(word, terms, true);
      if (!correct) unknownSpellings.push(word);
    }

    return unknownSpellings;

  }

  /**
   * Adds type names and namespace prefixes to the list of allowable words.
   * This permits definitions to include things like "An augmentation point for type nc:PersonType"
   * @param {Release} release
   */
  async init(release) {

    this.niemNames = [];

    if (!release) return;

    // Add CCC type names to dictionary
    let types = await release.types.find({isComplexContent: true});
    this.niemNames = types.map( type => type.name );

    // Add namespace prefixes to dictionary
    let namespaces = await release.namespaces.find({conformanceRequired: true});
    this.niemNames.push( ...namespaces.map( namespace => namespace.prefix) );

  }

}


/**
 * @param {string} definition
 */
function processDefinition(definition) {

  let results = definition;

  // Replace non-space text in parentheses with a space, e.g., "(CMV)"" => " "
  results = results.replace(/\(\S*\)/g, "")

  // Remove urls from the definition
  results = results.replace(/https?.* /g, "")
  results = results.replace(/https?.*\.?$/g, "")

  // Replace everything that isn't a word character with a space
  results = results.replace(/[^\w]/g, " ")

  return results;
}


module.exports = SpellChecker;
