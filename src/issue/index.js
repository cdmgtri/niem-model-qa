
let { NIEMObject } = require ("niem").ModelObjects;

class Issue {

  /**
   * @param {String} label
   * @param {String} location - A file name or spreadsheet tab
   * @param {String} line - A line number from a file or a row number
   * @param {String} position - A character position or a column name
   * @param {String} problemValue
   * @param {String} expectedValue
   * @param {String} explanation
   */
  constructor(label="", location="", line="", position="", problemValue="", expectedValue="", explanation) {

    this.label = label;
    this.location = location;
    this.line = line;
    this.position = position;
    this.problemValue = problemValue;
    this.expectedValue = expectedValue;
    this.explanation = explanation;

  }

  /**
   * @param {NIEMObject[]} problemComponents
   * @param {String} problemField
   * @param {String} expectedValue
   * @param {String} explanation
   */
  static getIssues(problemComponents, problemField, expectedValue="", explanation) {

    return problemComponents.map( component => {

      let problemValue = problemField == "" ? "" : component[problemField];

      let location = component && component.source ? component.source.location : "";
      let line = component && component.source ? component.source.line : "";
      let position = component && component.source ? component.source.position : "";

      return new Issue(component.label, location, line, position, problemValue, expectedValue, explanation);
    });

  }

}

module.exports = Issue;
