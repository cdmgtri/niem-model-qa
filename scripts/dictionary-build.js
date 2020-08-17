#!usr/bin/env node

let en = require("dictionary-en");
let fs = require("fs").promises;
let Spellchecker = require("hunspell-spellchecker");
let Utils = require("util");

async function exportDictionary() {

  // Read dictionary and affix files into an object with buffers
  let dictionaryParser = Utils.promisify(en);
  let dictionaryBuffers = await dictionaryParser();

  // Parses and serializes the dictionary object
  let spellchecker = new Spellchecker();
  let dictionary = spellchecker.parse(dictionaryBuffers);
  dictionary.compoundRules = [];

  // Save the dictionary as JSON
  let json = JSON.stringify(dictionary, null, 2);
  await fs.writeFile("src/utils/dictionary-en.json", json, "utf-8");

  console.log("US-English dictionary exported as JSON");

}

exportDictionary();
