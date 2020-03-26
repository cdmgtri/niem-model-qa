
let { Nodehun } = require("nodehun");
let en = require("dictionary-en");

let { Release } = require("niem-model");

/** @type {{allow: string[], exclude: string[]}} */
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
    this.checkLongText;
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
      await this.nodehun.add(word);
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
   * @param {string} word
   */
  async checkWord(word) {
    return this.nodehun.spell(word);
  }

  /**
   * @param {string} word
   */
  async suggestions(word) {
    return this.nodehun.suggest(word);
  }

  /**
   * @param {string} text
   * @returns {Promise<{word: string, suggestions: string[], positions: {from: number, to: number, length: number}[]}[]>}
   */
  async checkLongText(text) {

    let unknownSpellings = [];

    let updatedText = text
    .replace(/\(\S*\)/g, "")   // Replace non-space text in parentheses with a space, e.g., "(CMV)"" => " "
    .replace(/[^\w]/g, " ")    // Replace everything that isn't a word character with a space
    .replace(/https?.* /g, "")
    .replace(/https?.*\.?$/g, "")

    let uniqueWords = new Set(updatedText.split(/\s+/));
    uniqueWords.delete("");

    for (let word of uniqueWords) {
      let correct = await this.checkWord(word);

      if (!correct) {
        // Create a new result object for the unknown word
        let unknownSpelling = {
          word,
          positions: []
        };

        // Find each position of the unknown word in the original text
        let wordPattern = word.replace("(", "\\\(").replace(")", "\\\)");
        let matches = text.match(new RegExp(wordPattern, "g"));
        if (!matches) continue;

        let lastIndex = 0;
        for (let i = 0; i < matches.length; i ++) {
          let index = text.indexOf(word, lastIndex);
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

module.exports = SpellChecker;
