import * as XLSX from 'xlsx';

/**
 * Parses an Excel or CSV file using SheetJS (XLSX).
 * @param {File} file - The file object uploaded by the user.
 * @returns {Promise<{headers: string[], rows: object[], sheetNames: string[], activeSheet: string}>}
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        const sheetNames = workbook.SheetNames;
        const activeSheet = sheetNames[0];
        const worksheet = workbook.Sheets[activeSheet];
        
        // Parse rows as objects
        // raw: false makes sure dates and numbers are formatted nicely, 
        // but we want raw values too for numeric operations, so we get them as raw: true
        let rows = XLSX.utils.sheet_to_json(worksheet, { defval: null });
        
        // Get all headers from the sheet (in case some rows don't have all columns)
        const headers = [];
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const address = XLSX.utils.encode_cell({ r: range.s.r, c: C });
          const cell = worksheet[address];
          if (cell && cell.v !== undefined) {
            headers.push(String(cell.v).trim());
          }
        }

        // Fallback to keys of rows if headers are empty
        const finalHeaders = headers.length > 0 ? headers : (rows.length > 0 ? Object.keys(rows[0]) : []);

        // Find any header matching 'bparty' case-insensitively
        const bpartyHeaders = finalHeaders.filter(h => /bparty/i.test(h));
        if (bpartyHeaders.length > 0) {
          rows = rows.filter(row => {
            return bpartyHeaders.every(bh => {
              const val = row[bh];
              if (val !== null && val !== undefined && val !== '') {
                const strVal = String(val).trim();
                // Rule 1: Remove rows where bparty contains alphabets mixed with digits (alphanumeric)
                // A valid bparty should be purely numeric (digits only, possibly with + or spaces)
                const hasLetters = /[a-zA-Z]/.test(strVal);
                if (hasLetters) return false;
                // Rule 2: Remove rows where bparty digit count is <= 9
                const digits = strVal.replace(/\D/g, '');
                if (digits.length <= 9) return false;
              }
              return true; // Keep row if bparty is empty/absent
            });
          });
        }

        resolve({
          headers: finalHeaders,
          rows,
          sheetNames,
          activeSheet
        });
      } catch (error) {
        reject(new Error('Failed to parse Excel file: ' + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('File reading error.'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Detects the data types of columns in a dataset.
 * Data types: 'number' | 'date' | 'category' | 'location' | 'text'
 * @param {string[]} headers 
 * @param {object[]} rows 
 * @returns {object} Map of header -> type
 */
export const detectColumnTypes = (headers, rows) => {
  const types = {};
  if (rows.length === 0) {
    headers.forEach(h => { types[h] = 'text'; });
    return types;
  }

  // Location headers regex pattern
  const locationRegex = /(city|town|country|state|province|region|address|location|zip|postal|latitude|longitude|lat|lng|district|neighborhood|continent)/i;
  
  headers.forEach(header => {
    // 1. Check if the header matches location indicators
    if (locationRegex.test(header)) {
      types[header] = 'location';
      return;
    }

    let numericCount = 0;
    let dateCount = 0;
    let emptyCount = 0;
    const uniqueValues = new Set();
    const sampleSize = Math.min(rows.length, 100); // Check first 100 rows for performance
    
    for (let i = 0; i < sampleSize; i++) {
      const val = rows[i][header];
      if (val === null || val === undefined || val === '') {
        emptyCount++;
        continue;
      }

      uniqueValues.add(val);

      // Check for numeric
      if (typeof val === 'number' && !isNaN(val)) {
        numericCount++;
      } else if (typeof val === 'string' && !isNaN(Number(val.replace(/[\$,%]/g, ''))) && val.trim() !== '') {
        numericCount++;
      }

      // Check for date
      if (val instanceof Date && !isNaN(val.getTime())) {
        dateCount++;
      } else if (typeof val === 'string') {
        const dateTest = Date.parse(val);
        // Ensure string is not just a simple number before matching dates
        if (!isNaN(dateTest) && isNaN(Number(val)) && val.length > 5) {
          dateCount++;
        }
      }
    }

    const validSamples = sampleSize - emptyCount;
    if (validSamples === 0) {
      types[header] = 'text';
      return;
    }

    // Determine type by majority of sample content
    if (numericCount / validSamples > 0.8) {
      types[header] = 'number';
    } else if (dateCount / validSamples > 0.8) {
      types[header] = 'date';
    } else {
      // Determine if Category (low cardinality)
      const cardinalityRatio = uniqueValues.size / validSamples;
      if (cardinalityRatio < 0.25 || uniqueValues.size < 15) {
        types[header] = 'category';
      } else {
        types[header] = 'text';
      }
    }
  });

  return types;
};
