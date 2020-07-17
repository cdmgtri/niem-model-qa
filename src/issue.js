
class Issue {

  /**
   * @param {String} prefix - Namespace prefix of the affected component
   * @param {String} label - User-friendly label to identify the affected component
   * @param {String} location - A file name or spreadsheet tab
   * @param {String} line - A line number from a file or a row number
   * @param {String} position - A character position or a column name
   * @param {String} problemValue
   * @param {String} comments
   * @param {Test} test
   */
  constructor(prefix, label, location, line, position, problemValue, comments, test) {

    this.prefix = prefix;
    this.label = label;
    this.location = location;
    this.line = line;
    this.position = position;
    this.problemValue = problemValue;
    this.comments = comments;

    this.test = test;

  }

  toJSON() {
    return {
      prefix: this.prefix,
      label: this.label,
      location: this.location,
      line: this.line,
      position: this.position,
      problemValue: this.problemValue,
      comments: this.comments
    }
  }

}

const Test = require("./test");

module.exports = Issue;
