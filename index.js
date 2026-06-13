const fs = require("fs");
const pdf = require("pdf-parse");
const XLSX = require("xlsx");
function extractLinesFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  return pdf(dataBuffer).then(function (data) {
    return data.text.split("\n");
  });
}

const filePath = "C:\\Users\\Admin\\Downloads\\MBBS-R1.pdf";

function parseAllLines(lines) {
  const rows = [];

  const knownCategories = [
    "OBC", "SC", "ST", "NTC", "NTB", "NTD", "SEBC", "EWS",
    "HA", "VJ", "SBC", "VJNT", "NT1(B)", "NT2(C)", "NT3(D)", "OPEN",
    "VJA", "SOBC"
  ];

  lines.forEach(function (line) {
    const cleanLine = line.trim();
    if (!cleanLine) return;

    const parts = cleanLine.split(/\s+/);

    if (parts.length < 5 || !/^\d+$/.test(parts[0]) || !/^\d+$/.test(parts[1])) return;

    const SrNo = parts[0];
    const AIR = parts[1];
    const NEET_No = parts[2];
    const CET_No = parts[3];

    let genderIdx = -1;
    for (let i = parts.length - 1; i > 3; i--) {
      if (parts[i] === "M" || parts[i] === "F" || parts[i] === "T") {
        const next = parts[i + 1];
        if (next && (
          knownCategories.includes(next) ||
          next.includes("NT") ||
          next.includes("PWD") ||
          next === "Choice" ||
          next === "OPEN" ||
          /^\d{4}/.test(next)
        )) {
          genderIdx = i;
          break;
        }
      }
    }

    if (genderIdx === -1) return;

    const Name = parts.slice(4, genderIdx).join(" ");
    const Gender = parts[genderIdx];
    const remaining = parts.slice(genderIdx + 1);

    let Category = "";
    let Quota = "";
    let College = "";

    if (remaining.length > 0) {
      let lookAheadIndex = 0;

      const firstToken = remaining[0];
      if (knownCategories.includes(firstToken) || firstToken.includes("NT") || firstToken.includes("PWD")) {
        Category = firstToken;
        lookAheadIndex = 1;

        if (remaining[1] && (remaining[1] === "PWD" || remaining[1] === "DEF" || remaining[1] === "HA")) {
          Category += " " + remaining[1];
          lookAheadIndex = 2;
        }
      }

      const afterCategory = remaining.slice(lookAheadIndex);

      let collegeStartIdx = -1;
      for (let j = 0; j < afterCategory.length; j++) {
        if (/^\d{4}$/.test(afterCategory[j]) || /^\d{4}:/.test(afterCategory[j])) {
          collegeStartIdx = j;
          break;
        }
      }

      if (afterCategory.join(" ").includes("Choice Not Available")) {
        const cnaIdx = afterCategory.indexOf("Choice");
        Quota = afterCategory.slice(0, cnaIdx).join(" ").trim();
        College = "Choice Not Available";
      } else if (collegeStartIdx !== -1) {
        Quota = afterCategory.slice(0, collegeStartIdx).join(" ").trim();
        College = afterCategory.slice(collegeStartIdx).join(" ").trim();
      } else {
        Quota = afterCategory.join(" ").trim();
        College = "";
      }
    }

    rows.push({ SrNo, AIR, NEET_No, CET_No, Name, Gender, Category, Quota, College });
  });

  console.log("Successfully extracted rows:", rows.length);
  return rows;
}

function exportToExcel(rows) {
  const headers = ["SrNo", "AIR", "NEET No", "CET No", "Name", "Gender", "Category", "Quota", "College"];
  const keys = ["SrNo", "AIR", "NEET_No", "CET_No", "Name", "Gender", "Category", "Quota", "College"];

  const wsData = [headers, ...rows.map(r => keys.map(k => r[k] || ""))];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  XLSX.utils.book_append_sheet(wb, ws, "MBBS Results");

  const outputPath = "MBBS-R1-Output.xlsx";
  XLSX.writeFile(wb, outputPath);
  console.log(`\nExcel file saved: ${outputPath}`);
}

extractLinesFromPdf(filePath)
  .then(parseAllLines)
  .then(exportToExcel)
  .catch(function (err) {
    console.error("Critical Runtime Error:", err);
  });