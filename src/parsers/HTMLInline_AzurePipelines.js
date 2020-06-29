const getHref = child => {
    var tag = child.getElementsByTagName('a');
    if (!tag | !tag[0]) { return ""; };
    return tag[0].href;
};

const parseRow = (row, baseURI) => {
    let obj = {
        fileName: row.firstChild.innerText,
        lineCoverage: parseFloat(row.cells[5].innerText.split("%")[0]),
        branchCoverage: parseFloat(row.cells[7] !== undefined ? row.cells[7].innerText.split("%")[0] : "--") || 100,
        link: getHref(row.firstChild)
    }
    if (obj.link !== "") {
        obj.link = baseURI + obj.link.split("/", 16).pop();
        return obj;
    }
};

export const getTestCoverageFromHTML = (coverageReport, baseURI) => {
    console.log("Parsing HTML coverage report");
    let parser = new DOMParser();
    const coverageReportHTML = parser.parseFromString(coverageReport, 'text/html');
    const tablerows = coverageReportHTML.getElementsByClassName("overview table-fixed stripped")[0].rows;
    
    let mappedCoverage = [];
    
    for (let i = 0, len = tablerows.length; i < len; i++) {
        let obj = parseRow(tablerows[i], baseURI);
        if (obj !== undefined) {
            mappedCoverage.push(obj);
        }
    };
    
    return mappedCoverage;
};