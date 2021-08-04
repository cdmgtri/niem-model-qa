
let xlsx = require("xlsx-populate");

/**
 * @private
 * @type {import("xlsx-populate").Workbook}
 */
let WorkbookDef;

class SpreadsheetUtils {

  /**
   * Reads in the spreadsheet at the given filepath into a XLSX-populate workbook object
   */
  static async getWorkbook(filePath) {
    return xlsx.fromFileAsync(filePath);
  }

  /**
   * Converts a worksheet into an array of row objects
   *
   * @param {WorkbookDef} workbook
   * @param {number} sheetIndex
   * @param {boolean} removeHeaderRow
   */
  static async getRows(workbook, sheetIndex, removeHeaderRow=false) {

    /** @type {Object[]} */
    let rows = workbook.sheet(sheetIndex).usedRange().value();

    if (removeHeaderRow) {
      rows.splice(0, 1);
    }

    return rows;

  }


}

module.exports = SpreadsheetUtils;
