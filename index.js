const fs = require("fs");
const pdf = require("pdf-parse");

const filePath = "C:\\Users\\Admin\\Downloads\\MBBS-R1.pdf";

const dataBuffer = fs.readFileSync(filePath);

pdf(dataBuffer)
  .then(function (data) {


  const lines = data.text.split("\n");
  console.log(lines);
  })
  .catch(function (err) {

    console.log(err);

  });
  