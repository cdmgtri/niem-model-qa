
let HunspellSpellchecker = require("hunspell-spellchecker");

let { Release } = require("niem-model");

/** @type {{allow: string[], exclude: string[], special: string[]}} */
let customDictionary = require("../../customDictionary.json");


class SpellChecker {

  constructor() {

    this.count = 0;

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
    this.allowedTerms = customDictionary.allow.map( term => term.toLowerCase() );

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

    this.count++;

    // Reject words that are in the excluded list (e.g. "Org")
    if (this.excludedTerms.includes(word)) return false;

    // Approve pre-approved terms that do not tokenize correctly
    if (this.specialTerms.includes(word)) return true;

    //  @todo Update niem-model Component.terms to remove hyphens
    word = word.replace(/-/g, "");
    if (word =="") return true;

    if (this.dictionary.checkExact(word.toLowerCase()) || this.dictionary.checkExact(word) ) return true;

    // Check the pre-approved list of allowed terms (case-insensitive)
    if (this.allowedTerms.concat(terms).includes(word.toLowerCase())) return true;

    // Check the given list of local terminology terms
    if ( terms.map( term => term.toLowerCase() ).includes(word.toLowerCase() ) ) return true;

    // Check to see if the word is one of the various special exceptions
    if (isDefinitionCheck && this.niemNames.includes(word)) return true;

    // Check to see if the word is all digits
    if (word.match(/^\d+$/g)) return true;

    return false;

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

    // Add property names to the dictionary
    let properties = await release.properties.find();
    this.niemNames.push( ...properties.map( property => property.name ));

    // Add namespace prefixes to dictionary
    let namespaces = await release.namespaces.find();
    this.niemNames.push( ...namespaces.map( namespace => namespace.prefix) );

  }

}


/**
 * @param {string} definition
 */
function processDefinition(definition) {

  let results = definition;

  // Replace parentheses with spaces, e.g., "(CMV)" => " "
  results = results.replace(/\(\S*\)/g, "")

  // Remove urls from the definition
  results = results.replace(/https?.*( |\.|$)/g, "")

  // Replace everything that isn't a word character with a space
  results = results.replace(/[\W]/g, " ")

  // Remove digits followed immediately by 'ppi'
  results = results.replace(/\dppi( |\.|$)/g, " ");

  // Replace solo groups of digits with a space
  results = results.replace(/\d+( |$)/g, " ");

  return results;

}


module.exports = SpellChecker;
