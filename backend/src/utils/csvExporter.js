import json2csv from 'json2csv';
const { Parser } = json2csv;

const exportToCSV = (data, fields = []) => {
  try {
    const json2csvParser = new Parser({ fields });
    return json2csvParser.parse(data);
  } catch (error) {
    throw new Error(`CSV Generation Failed: ${error.message}`);
  }
};

export default exportToCSV;
