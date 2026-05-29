const fs = require("fs");
const pdf = require("pdf-parse");

const filePath = "C:\\Users\\Admin\\Downloads\\MBBS-R1.pdf";

const dataBuffer = fs.readFileSync(filePath);

pdf(dataBuffer)

.then(function (data) {

    const lines = data.text.split("\n");

    let output = [];

    output.push(
        "SrNo".padEnd(6) +
        "AIR".padEnd(8) +
        "NEET No".padEnd(15) +
        "CET No".padEnd(15) +
        "Name".padEnd(35) +
        "G".padEnd(5) +
        "Cat.".padEnd(10) +
        "Quota".padEnd(20) +
        "Code College"
    );

    output.push("-".repeat(150));

    for (let line of lines) {

        let trimmedLine = line.trim();

        if (/^\d+\s+\d+\s+\d+/.test(trimmedLine)) {

            let cleanLine =
                trimmedLine.replace(/\s+/g, " ");

            let parts = cleanLine.split(" ");

            let srNo = parts[0] || "";
            let air = parts[1] || "";
            let neet = parts[2] || "";
            let cet = parts[3] || "";

            let remaining = parts.slice(4);

            let genderIndex = remaining.findIndex(
                word => word === "M" || word === "F"
            );

            if (genderIndex !== -1) {

                let name =
                    remaining.slice(0, genderIndex).join(" ");

                let gender = remaining[genderIndex];

                let afterGender =
                    remaining.slice(genderIndex + 1);

                let codeIndex = afterGender.findIndex(
                    word => /^\d{4}:/.test(word)
                );

                let beforeCollege = [];
                let college = "";

                if (codeIndex !== -1) {

                    beforeCollege =
                        afterGender.slice(0, codeIndex);

                    college =
                        afterGender.slice(codeIndex).join(" ");
                }

                let category = beforeCollege[0] || "";

                let quota =
                    beforeCollege.slice(1).join(" ");

                let finalLine =
                    srNo.padEnd(6) +
                    air.padEnd(8) +
                    neet.padEnd(15) +
                    cet.padEnd(15) +
                    name.padEnd(35) +
                    gender.padEnd(5) +
                    category.padEnd(10) +
                    quota.padEnd(20) +
                    college;

                output.push(finalLine);
            }
        }
    }

    fs.writeFileSync(
        "output.txt",
        output.join("\n")
    );

    console.log("Data saved in output.txt");

})

.catch(function (err) {

    console.log("Error:", err);

});