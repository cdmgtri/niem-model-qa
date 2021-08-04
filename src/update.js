
/**
 * Update information for the progress tracker.
 * Can be used to display progress to users waiting for tests to run.
 */
class Update {

  /**
   * @param {"in progress"|"done"} status
   * @param {string} label
   * @param {string} description
   * @param {number} testCount
   */
  constructor(status, label, description, testCount) {

    this.status = status;
    this.label = label;
    this.description = description;

    this.currentMessage = "";
    this.startTime = Date.now();

    /** @type {number} */
    this.endTime;

    this.countTests = testCount;

    /** @type {number} */
    this.countPassed;

  }

  get countFailed() {
    if (this.countTests && this.countPassed) {
      return this.countTests - this.countPassed;
    }
  }

  get done() {
    return this.endTime != null;
  }

  /**
   * Updates a status as "done".
   * @param {number} testsPassed
   */
  end(testsPassed) {
    this.status = "done";
    this.endTime = Date.now();
    this.countPassed = testsPassed;
  }

  /**
   * Log what is currently happening
   * @param {string} currentMessage
   */
  log(currentMessage) {
    this.currentMessage = currentMessage;
  }

  get outcome() {
    if (this.countFailed > 0) return "failed";
    if (this.countFailed == 0) return "passed";
    return "in progress";
  }

  get runTime() {
    if (this.startTime && this.endTime) {
      // Round to 1 decimal
      return +((this.endTime - this.startTime)/ 1000).toFixed(1);
    }
  }

}

module.exports = Update;
