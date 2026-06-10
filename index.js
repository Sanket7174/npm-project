const fs = require("fs");
const pdf = require("pdf-parse");
const ExcelJS = require("exceljs");
const filePath = "C:\\Users\\Admin\\Downloads\\MBBS-R1.pdf";
const outputPath = "C:\\Users\\Admin\\Downloads\\MBBS_Output.xlsx";
function extractLinesFromPdf(filePath) {

  const dataBuffer = fs.readFileSync(filePath);

  return pdf(dataBuffer).then(function (data) {

    const lines = data.text.split("\n");

    console.log("Total raw lines extracted from PDF:", lines.length);

    return lines;

  });

}

function parseLine(line) {
  const cleanLine = line.trim();
  if (!cleanLine) return null;
  const parts = cleanLine.split(/\s+/);
  if (parts.length < 5 || !/^\d+$/.test(parts[0]) || !/^\d+$/.test(parts[1])) {

    return null;

  }

  const SrNo = parts[0];

  const AIR = parts[1];

  const NEET_No = parts[2];

  const CET_No = parts[3];

  let genderIdx = parts.findIndex((p, idx) => idx > 3 && (p === "M" || p === "F"));

    if (genderIdx === -1) {

    genderIdx = parts.findIndex((p, idx) => idx > 3 && p.length === 1 && /^[A-Z]$/.test(p));

  }
if (genderIdx === -1) return null; 
  const Name = parts.slice(4, genderIdx).join(" ");
  const Gender = parts[genderIdx];
  const remaining = parts.slice(genderIdx + 1);
  let Category = "";

  let Quota = "";

  let College = "";
  const knownCategories = [

    "OBC", "SC", "ST", "NTC", "NTB", "NTD", "SEBC", "EWS", 

    "HA", "VJ", "SBC", "VJNT", "NT1(B)", "NT2(C)", "NT3(D)", "OPEN"

  ];

  if (remaining.length > 0) {

    let lookAheadIndex = 0;

        if (knownCategories.includes(remaining[0]) || remaining[0].includes("NT") || remaining[0].includes("PWD")) {

      Category = remaining[0];

      lookAheadIndex = 1;

        if (remaining[1] === "PWD" || remaining[1] === "DEF" || remaining[1] === "HA") {

        Category += " " + remaining[1];

        lookAheadIndex = 2;

      }

    }

const finalTokens = remaining.slice(lookAheadIndex);
  const finalString = finalTokens.join(" ");


    if (finalString.includes("Choice Not Available")) {

      Quota = finalString.replace("Choice Not Available", "").trim();

      College = "Choice Not Available";

    } else {

      const collegeCodeMatch = finalString.match(/(\d{4}:?.*)$/);

      if (collegeCodeMatch) {

        College = collegeCodeMatch[1];

        Quota = finalString.replace(College, "").trim();

      } else {

        Quota = finalString;

      }

    }

  }


  return { SrNo, AIR, NEET_No, CET_No, Name, Gender, Category, Quota, College };

}

function parseAllLines(lines) {

  const rows = [];

  let skippedDataLines = 0;

  lines.forEach(function (line) {

    const parsed = parseLine(line);

    if (parsed) {

      rows.push(parsed);

    } else {

      if (/^\s*\d+\s+\d+/.test(line)) {

        console.log(" Failed to parse data row:", line.trim());

        skippedDataLines++;

      }

    }

  });

  console.log("\n--- Extraction Summary ---");

  console.log("Successfully extracted rows:", rows.length);

  if (skippedDataLines > 0) {

    console.log(" Total rows skipped:", skippedDataLines);

  } else {

    console.log(" Perfect run! 100% data extraction complete.");

  }

  return rows;

}

function saveToExcel(rows) {

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("MBBS Data");
  const headers = ["SrNo", "AIR", "NEET No", "CET No", "Name", "Gender", "Category", "Quota", "College"];
  const widths = [10, 12, 15, 15, 35, 10, 15, 25, 45];
  const headerRow = sheet.addRow(headers);
  headerRow.eachCell(function (cell) {

    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };

    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E4057" } };

    cell.alignment = { horizontal: "center", vertical: "middle" };

  });

  headers.forEach(function (_, i) {

    sheet.getColumn(i + 1).width = widths[i];

  });
  rows.forEach(function (row, idx) {

    const r = sheet.addRow([

      row.SrNo, row.AIR, row.NEET_No, row.CET_No,

      row.Name, row.Gender, row.Category, row.Quota, row.College,

    ]);

    if (idx % 2 === 0) {

      r.eachCell(function (cell) {

        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F4F8" } };

      });

    }

  });

  return workbook.xlsx.writeFile(outputPath).then(function () {

    console.log(" File successfully generated and saved to:", outputPath);

  });

}

extractLinesFromPdf(filePath)

  .then(parseAllLines)

  .then(saveToExcel)

  .catch(function (err) {

    console.error("Critical Runtime Error:", err);

  }); 