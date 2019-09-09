const criticalLineCoverage = 80;
const warningLineCoverage = 90;
const criticalBranchCoverage = 80;
const warningBranchCoverage = 90;

const addTag = (link, icon) =>{
    var tag = document.createElement('a');
    tag.setAttribute('href', link);
    tag.setAttribute('target', '_blank');
    tag.innerText = icon;
    return tag;
  };

export const showCodeCoverageOnFile = (files, codeCoverage) => {
    files.forEach(file => {
      const fileCodeCoverage = codeCoverage.find(coverage => {
        return file.attributes["content"].value.includes(coverage.fileName);
      });

      if(fileCodeCoverage){
        const coverageInfo = document.createElement('span');
        let textColor;
        if(fileCodeCoverage.lineCoverage < criticalLineCoverage || fileCodeCoverage.branchCoverage < criticalBranchCoverage) {
          textColor = 'red';
        } else if (fileCodeCoverage.lineCoverage < warningLineCoverage || fileCodeCoverage.branchCoverage < warningBranchCoverage) {
          textColor = 'orange';
        } else {
          textColor = 'green';
        }
        coverageInfo.style.cssText = `font-weight: 500;color: ${textColor};`
        coverageInfo.innerText = ` L: ${fileCodeCoverage.lineCoverage}% B: ${fileCodeCoverage.branchCoverage || 0 }%`
        file.appendChild(coverageInfo);
        if(fileCodeCoverage.link) {
            file.appendChild(addTag(fileCodeCoverage.link, " 👁️"));
        }
      }
    })
  };