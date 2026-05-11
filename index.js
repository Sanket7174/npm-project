const fs = require("fs");
const pdf = require("pdf-parse");

const pdfPath = process.argv[2];

if (!pdfPath) {
  console.log("Usage: node extractrawdata.js <pdf-path>");
  console.log('Example: node extractrawdata.js "C:\\Users\\Admin\\Downloads\\MBBS-R1.pdf"');
  process.exit(1);
}

console.log("Reading PDF:", pdfPath);
const buffer = fs.readFileSync(pdfPath);
console.log("Parsing... please wait...");

pdf(buffer).then(data => {
  const lines = data.text.split("\n");
  let count = 0;

  lines.forEach(line => {
    line = line.trim();
    if (/^\d+\s+\d+\s+\d{10}/.test(line)) {
      console.log(line);
      count++;
    }
  });

  console.error("\nTotal records found:", count);

}).catch(err => {
  console.log("Error:", err.message);
});