export const getTestCoverageFromXML = coverageReport => {
    const coverageReportXML = $.parseXML(coverageReport);
    const classes = coverageReportXML.getElementsByTagName('class');
    
    console.log("Parsing Coverage XML");

    let mappedCoverage = [];
    for (let i = 0; i < classes.length; i++) {
        let obj = {
            fileName: classes[i].attributes['filename'].value.replace(/\//gi, ".").split(".app.", 2)[1],
            lineCoverage: Math.floor(parseFloat(classes[i].attributes['line-rate'].value) * 100),
            branchCoverage: Math.floor(parseFloat(classes[i].attributes['branch-rate'].value) * 100)
        };
        mappedCoverage.push(obj);
    }

    return mappedCoverage;
};