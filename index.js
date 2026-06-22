const fs = require("fs");
const pdf = require("pdf-parse");
const xlsx = require("xlsx");

const inputFile = "C:\\Users\\Admin\\Downloads\\MBBS-R1.pdf";
const outputFile = "C:\\Users\\Admin\\Downloads\\ExtractedData.xlsx";

async function extractTableToExcel() {
    
        const dataBuffer = fs.readFileSync(inputFile);
        const data = await pdf(dataBuffer);
        const processingStart = Date.now();
        const lines = data.text.split("\n");
        const excelData = [
            [
                "Sr. No.",
                "AIR",
                "Roll No.",
                "CET Form No.",
                "Name",
                "Gender",
                "Category",
                "Quota",
                "College Code"
            ]
        ];

        const rows = await Promise.all(
          lines.map(async (line) => {

        const srNo = line.substring(0, 7).trim();
        const air = line.substring(7, 15).trim();

        if (!srNo || !air || isNaN(srNo) || isNaN(air)) {
            return null;
        }

        return [
            srNo,
            air,
            line.substring(15, 27).trim(),
            line.substring(27, 40).trim(),
            line.substring(40, 73).trim(),
            line.substring(73, 76).trim(),
            line.substring(76, 87).trim(),
            line.substring(87, 114).trim(),
            line.substring(114).trim()
        ];
    })
);

        excelData.push(...rows.filter(Boolean));

        const worksheet = xlsx.utils.aoa_to_sheet(excelData);

        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(
            workbook,
            worksheet,
            "Allotements"
        );

        const processingEnd = Date.now();

        console.log(
            "Processing Time (Without PDF Parse & Excel Write):",
            processingEnd - processingStart,
            "ms"
        );

        xlsx.writeFile(workbook, outputFile);
        console.log("Extraction Completed Successfully");

}

   extractTableToExcel();