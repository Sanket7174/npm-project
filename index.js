const fs = require("fs");
const pdf = require("pdf-parse");

const filePath = "C:\\Users\\Admin\\Downloads\\MBBS-R1.pdf";

const dataBuffer = fs.readFileSync(filePath);

pdf(dataBuffer)
  .then(function (data) {

    // RAW DATA with \n visible
  
   console.log(data);
  //  console.log(JSON.stringify(data.text));
  const lines = data.text.split("\n");
  console.log(lines);
  })
  .catch(function (err) {

    console.log(err);

  });
  