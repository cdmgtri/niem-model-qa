
let { Nodehun } = require("nodehun");
let en = require("dictionary-en");

let { Release } = require("niem-model");

/** @type {{allow: string[], exclude: string[], special: string[]}} */
let customDictionary = require("../../customDictionary.json");

/**
 * Create a promise wrapper to load the US English dictionary
 * @returns {Promise<{dic: Buffer, aff: Buffer}>}
 */
function loadDictionary() {
  return new Promise( (resolve, reject) => {
    en( (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}


class SpellChecker {

  constructor() {
    this.nodehun;
    this.specialTerms = customDictionary.special;
  }

  /**
   * @param {Release} release
   */
  async init(release) {

    // Load the US English dictionary
    let results = await loadDictionary();
    this.nodehun = new Nodehun(results.aff, results.dic);

    // Load custom dictionary list of allowed and excluded terms
    await this.addWords(customDictionary.allow);
    await this.removeWords(customDictionary.exclude);

    if (release) {
      // Add CCC type names to dictionary
      let types = await release.types.find({isComplexContent: true});
      for (let type of types) {
        await this.nodehun.add(type.name);
      }

      // Add namespace prefixes to dictionary
      let namespaces = await release.namespaces.find({conformanceRequired: true});
      for (let namespace of namespaces) {
        await this.nodehun.add(namespace.prefix);
      }
    }

  }

  /**
   * Add words to the dictionary
   * @param {string[]} words
   */
  async addWords(words) {
    for (let word of words) {
      if (!word) continue;
      await this.nodehun.add(word);
      await this.nodehun.add(word[0].toUpperCase() + word.slice(1));
    }
  }

  /**
   * Remove words from the dictionary
   * @param {string[]} words
   */
  async removeWords(words) {
    for (let word of words) {
      await this.nodehun.remove(word);
    }
  }

  /**
   * Check against dictionary and given local terms
   * @param {string} word
   * @param {string[]} terms
   */
  async checkWord(word, terms) {
    let passed = await this.nodehun.spell(word);
    if (!passed && terms) passed = terms.find( term => term.toLowerCase() == word.toLowerCase() );
    return passed;
  }

  /**
   * @param {string} word
   */
  async suggestions(word) {
    return this.nodehun.suggest(word);
  }

  /**
   * @param {string} definition
   * @param {string[]} terms
   * @returns {Promise<{word: string, suggestions: string[], positions: {from: number, to: number, length: number}[]}[]>}
   */
  async checkDefinition(definition, terms) {

    let unknownSpellings = [];

    let processedDefinition = processDefinition(definition);

    let uniqueWords = new Set(processedDefinition.split(/\s+/));
    uniqueWords.delete("");

    for (let word of uniqueWords) {
      let correct = await this.checkWord(word, terms);

      if (!correct) {
        // Create a new result object for the unknown word
        let unknownSpelling = {
          word,
          positions: []
        };

        // Find each position of the unknown word in the original text
        let wordPattern = word.replace("(", "\\\(").replace(")", "\\\)");
        let matches = definition.match(new RegExp(wordPattern, "g"));
        if (!matches) continue;

        let lastIndex = 0;
        for (let i = 0; i < matches.length; i ++) {
          let index = definition.indexOf(word, lastIndex);
          let position = {
            start: index,
            end: index + word.length,
            length: word.length
          }
          unknownSpelling.positions.push(position);
          lastIndex = index;
        }

        unknownSpellings.push(unknownSpelling);
      }
    }

    return unknownSpellings;

  }

  /**
   * @param {Release} release
   * @param {string} prefix
   */
  async addLocalTerms(release, prefix) {
    let localTerms = await release.localTerms.find({prefix: prefix});
    let terms = localTerms.map( localTerm => localTerm.term );
    await this.addWords(terms);
  }

  /**
   * @param {Release} release
   * @param {string} prefix
   */
  async removeLocalTerms(release, prefix) {
    let localTerms = await release.localTerms.find({prefix: prefix});
    let terms = localTerms.map( localTerm => localTerm.term );
    await this.removeWords(terms);
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
