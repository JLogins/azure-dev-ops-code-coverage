const criticalLineCoverage = 80;
const warningLineCoverage = 90;
const criticalBranchCoverage = 80;
const warningBranchCoverage = 90;

const createTag = (link, icon) => {
  var tag = document.createElement("a");
  tag.setAttribute("href", link);
  tag.setAttribute("target", "_blank");
  tag.innerText = icon;
  return tag;
};

// FileCodeCoverage
// {
//   branchCoverage: Number
//   fileName: String
//   lineCoverage: Number
//   link: URL
// }

export const showCodeCoverageOnFile = (files, codeCoverage) => {
  console.log("Painting coverage on page");
  console.log(codeCoverage);

  //Match files on page with code coverage extracted
  files.forEach((file) => {
    const fileCodeCoverage = codeCoverage.find((coverage) => {
      let splitCovFile = coverage.fileName.split(".");
      console.log(
        file
          .getElementsByClassName("text-ellipsis")[0]
          .firstChild.innerText.split(".")[0]
      );
      return file
        .getElementsByClassName("text-ellipsis")[0]
        .firstChild.innerText.split(".")[0]
        .includes(splitCovFile[splitCovFile.lenght - 1]); //file.attributes["content"].value.includes(coverage.fileName);
    });

    if (fileCodeCoverage) {
      const coverageInfo = getCoverageTag(fileCodeCoverage);
      file.appendChild(coverageInfo);
      if (fileCodeCoverage.link) {
        appendLinkTag();
      }
    }
  });
};

//Where linecoverage, branchcoverage are Number
const getTextColor = (lineCoverage, branchCoverage) => {
  let textColor;
  if (
    lineCoverage < criticalLineCoverage ||
    branchCoverage < criticalBranchCoverage
  ) {
    textColor = "red";
  } else if (
    lineCoverage < warningLineCoverage ||
    branchCoverage < warningBranchCoverage
  ) {
    textColor = "orange";
  } else {
    textColor = "green";
  }
  return textColor;
};

//Where element is HTMLElement
const appendLinkTag = (element) => {
  element.appendChild(createTag(fileCodeCoverage.link, " 👁️"));
};

function getCoverageTag(fileCodeCoverage) {
  const coverageInfo = document.createElement("span");
  coverageInfo.style.cssText = `font-weight: 500;color: ${getTextColor(
    fileCodeCoverage.lineCoverage,
    fileCodeCoverage.branchCoverage
  )};`;
  coverageInfo.innerText = ` L: ${fileCodeCoverage.lineCoverage}% B: ${
    fileCodeCoverage.branchCoverage || 0
  }%`;
  return coverageInfo;
}
