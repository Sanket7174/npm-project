const fs = require("fs");
const pdf = require("pdf-parse");

const filePath = "C:\\Users\\Admin\\Downloads\\MBBS-R1.pdf";

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

function printToConsole(rows) {
  const headers = ["SrNo", "AIR", "NEET No", "CET No", "Name", "Gender", "Category", "Quota", "College"];
  const keys = ["SrNo", "AIR", "NEET_No", "CET_No", "Name", "Gender", "Category", "Quota", "College"];

  // Calculate dynamic column widths based on maximum value length
  const widths = headers.map((h) => h.length);
  rows.forEach((row) => {
    keys.forEach((key, i) => {
      const valStr = String(row[key] || "");
      if (valStr.length > widths[i]) {
        widths[i] = valStr.length;
      }
    });
  });

  const separator = "+" + widths.map((w) => "-".repeat(w + 2)).join("+") + "+";

  console.log("\n--- Extracted Data ---");
  console.log(separator);

  // Print headers
  const headerLine = "|" + headers.map((h, i) => " " + h.padEnd(widths[i]) + " ").join("|") + "|";
  console.log(headerLine);
  console.log(separator);

  // Print each row
  rows.forEach(function (row) {
    const rowLine = "|" + keys.map((key, i) => " " + String(row[key] || "").padEnd(widths[i]) + " ").join("|") + "|";
    console.log(rowLine);
  });

  console.log(separator);
}

extractLinesFromPdf(filePath)
  .then(parseAllLines)
  .then(printToConsole)
  .catch(function (err) {
    console.error("Critical Runtime Error:", err);
  });