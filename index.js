const fs = require('fs');
const pdf = require('pdf-parse');
const xlsx =require('xlsx');
async function extractTableToExcel() {
    try {
    const dataBuffer= fs.readFileSync('C:\\Users\\Admin\\Downloads\\MBBS-R1.pdf');
    const data =await pdf(dataBuffer);
    const lines=data.text.split('\n');

    const excelData=[];
    excelData.push(["Sr. No.", "AIR", "Roll No.","CET Form No.", " Name", "Gender", "Category", "Quota", "College Code"]);
        const validLines = lines.filter(line => { 
            const clean =line.trim();

        
            const parts= clean.split(/\s+/);

            return parts.length >5 &&
            !isNaN(parts[0])&&
            !isNaN(parts[1]);
        });
         validLines.forEach(line=>{
            const srNo=line.substring(0,7).trim();
            const air=line.substring(7,15).trim();
            const rollNo=line.substring(15,27).trim();
            const CETFormNo=line.substring(27,40).trim();
            const Name=line.substring(40,73).trim();
            const Gender=line.substring(73,76).trim();
            const Category=line.substring(76,87).trim();
            const quota=line.substring(87,114).trim();
            const CollegeCode=line.substring(114).trim();

        excelData.push([srNo, air, rollNo, CETFormNo, Name, Gender, Category, quota, CollegeCode]);

         });
         const workbook=xlsx.utils.book_new();
         const worksheet=xlsx.utils.aoa_to_sheet(excelData);
         xlsx.utils.book_append_sheet(workbook,worksheet,"Allotements");
         xlsx.writeFile(workbook,"C:\\Users\\Admin\\Downloads\\ExtractedData.xlsx");
         console.log("Extraction Completed with adjusted Substrings");
            
            }catch(error) {
                console.error("Error:",error);
               }
             }


            extractTableToExcel();

