const fs = require("fs");
const pdf = require("pdf-parse");

function extractLinesFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);

  return pdf(dataBuffer)
    .then(function (data) {
      const lines = data.text.split("\n");
      return lines;
    });
}

const filePath = "C:\\Users\\Admin\\Downloads\\MBBS-R1.pdf";

// Executing the step
extractLinesFromPdf(filePath)
  .then((lines) => {
    console.log(lines);
  })
  .catch((err) => {
    console.log("Error in step:", err);
  });