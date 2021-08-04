
class Issue {

  /**
   * @param {string} [prefix] - Namespace prefix of the affected component
   * @param {string} [label] - User-friendly label to identify the affected component
   * @param {string} [location] - A file name or spreadsheet tab
   * @param {string} [line] - A line number from a file or a row number
   * @param {string} [problemValue]
   * @param {string} [comments]
   * @param {Test} [test]
   */
  constructor(prefix, label, location, line, problemValue, comments, test) {

    this.prefix = prefix;
    this.label = label;
    this.location = location;
    this.line = line;
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
      problemValue: this.problemValue,
      comments: this.comments
    }
  }

}

const Test = require("./test");

module.exports = Issue;
