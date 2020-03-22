
let { Nodehun } = require("nodehun");
let en = require("dictionary-en");

let { Release } = require("niem-model");


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

  async init() {
    // Load the US English dictionary
    let results = await loadDictionary();
    this.nodehun = new Nodehun(results.aff, results.dic);
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
    for (let localTerm of localTerms) {
      await this.nodehun.add(localTerm.term);
    }
  }

  /**
   * @param {Release} release
   * @param {string} prefix
   */
  async removeLocalTerms(release, prefix) {
    let localTerms = await release.localTerms.find({prefix: prefix});
    for (let localTerm of localTerms) {
      await this.nodehun.remove(localTerm.term);
    }
  }


}

module.exports = SpellChecker;
