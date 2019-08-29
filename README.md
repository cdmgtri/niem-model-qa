
# NIEM Model QA

[![Build Status](https://travis-ci.org/cdmgtri/niem-model-qa.svg)](https://travis-ci.org/cdmgtri/niem-model-qa)
[![Coverage Status](https://coveralls.io/repos/github/cdmgtri/niem-model-qa/badge.svg)](https://coveralls.io/github/cdmgtri/niem-model-qa)

Provides QA checks for NIEM data, based on NIEM NDR rules and modeling best practices.

## Installation

```sh
npm i cdmgtri/niem-model-qa
```

## Usage

```js
let NIEMModelQA = require("niem-model-qa");

let qa = new NIEMModelQA();

// Load test metadata from spreadsheet
await qa.loadTests();

// Run a specific test
let spellCheckResults = await qa.type.test.name_camelCase(types, release);

// Run all tests on a specific type field
let nameResults = await qa.type.field.name(types, release);

// Run all type tests on a set of NIEM types
let allResults = await qa.type.all(types, release);

// Save or download QA results to a spreadsheet
await qa.testSuite.saveAsFile("test-results"); // or
await qa.testSuite.saveAsDownload("test-results");
```

## Test Status

Most CSC type, simple type, and facet tests have been implemented.

- [ ] Property tests
- [ ] Type tests
  - [ ] Complex type with complex content tests
  - [x] Complex type with simple content tests
  - [x] Simple type tests
  - [ ] Simple list type tests
  - [ ] Simple union type tests
- [ ] Type-has-property relationship tests
- [x] Code and other facet tests
- [ ] Namespace tests
- [ ] Local terminology tests
- [ ] Metadata tests
