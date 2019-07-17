
# NIEM QA

Provides QA checks for NIEM data, based on NIEM NDR rules and modeling best practices.

## Features


## Installation

```sh
npm i cdmgtri/niem-qa
```

## Test Status

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

## To Do

- [ ] Update test suite
  - [ ] Split model tests out from the tests.xlsx spreadsheet in the niem-mapping project, leaving the mapping spreadsheet-specific tests in the other project.
  - [ ] Add NDR rule numbers to existing tests
  - [ ] Add missing NDR tests
  - [ ] Add missing modeling QA tests
- [ ] Add separate namespace field to results issue list for easy filtering
- [ ] Refactor
  - [ ] Return ran test(s) from functions
  - [ ] Abstract reusable tests
- [ ] Implement remaining tests
- [ ] Format results
- [ ] Download results spreadsheet
- [ ] Add usage section to README
