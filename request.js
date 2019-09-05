// TODO move to .env file
const branchName;
const organization;
const project;
const codeCoverageCodeName;

getContainerId = getArtifactsUri =>
  new Promise((resolve, reject) => {
    $.ajax({
      url: getArtifactsUri
    })
      .done(data => {
        resolve(data.value[0].resource.data.split('/')[1]);
      })
      .error(error => {
        console.error(error);
        reject(error);
      });
  });

getCoverageXML = requestUri =>
  new Promise((resolve, reject) => {
    $.ajax({
      url: requestUri
    })
      .done(data => {
        resolve($.parseXML(data));
      })
      .error(error => {
        console.error(error);
        reject(error);
      });
  });

getTestCoverageFromXML = coverageReportXML => {
  let mappedCoverage = [];
  const classes = coverageReportXML.getElementsByTagName('class');
  for (let i = 0; i < classes.length; i++) {
    let obj = {
      fileName: '/' + classes[i].attributes['filename'].value,
      lineCoverage: parseFloat(classes[i].attributes['line-rate'].value) * 100,
      branchCoverage: parseFloat(classes[i].attributes['branch-rate'].value) * 100
    };
    mappedCoverage.push(obj);
  }

  return mappedCoverage;
};

getCommitedFileDomElements = () => {
  const filteredFiles = [];
  const allFiles = $('div.vc-tree-cell');
  for (let i = 0; i < allFiles.length; i++) {
    if (

      /\.ts+$/gi.test(allFiles[i].attributes['aria-label'].value) &&
      /^((?!\.spec\.).)*$/gi.test(allFiles[i].attributes['aria-label'].value)
    ) {
      filteredFiles.push(allFiles[i]);
    }
  }
  console.info(`Files to append to found: ${filteredFiles.length}`);
  return filteredFiles;
};

openCorrectTab = tabName => 
  new Promise((resolve, reject) => {
    if($(`[data-id="${tabName}"]`).hasClass('selected')){
      resolve();
    }
    const fileTab = $(`[data-id="${tabName}"] a`);
    if (fileTab[0]) {
      fileTab[0].click();
      setTimeout(() => 
        resolve()
      ,500);
    } else {
      reject(new Error(`Can't find ${tabName} tab.`));
    }
  })
;

onCorrectPageCheck = () => {
  const uri = new URL(document.baseURI);
  const uriPathNames = uri.pathname.split('/');
  if (uriPathNames[uriPathNames.length - 2] !== 'pullrequest') {
    throw new Error(
      `You need to be in ${branchName} pull request in order to run this script`
    );
  }
};

showCodeCoverageOnFile = (files, codeCoverage) => {
  files.forEach(file => {
    const fileCodeCoverage = codeCoverage.find(coverage => {
      return coverage.fileName === file.attributes['content'].value.split(' ')[0];
    });
    if(fileCodeCoverage){
      const coverageInfo = document.createElement('span');
      let textColor;
      if(fileCodeCoverage.lineCoverage < 80 || fileCodeCoverage.branchCoverage < 80) {
        textColor = 'red';
      } else if (fileCodeCoverage.lineCoverage < 90 || fileCodeCoverage.branchCoverage < 90) {
        textColor = 'orange';
      } else {
        textColor = 'green';
      }
      coverageInfo.style.cssText = `font-weight: 500;color: ${textColor};`
      coverageInfo.innerText = ` B: ${fileCodeCoverage.lineCoverage}% L: ${fileCodeCoverage.branchCoverage}%`
      file.appendChild(coverageInfo);
    }
  })
}

main = async () => {
  try {
    // Check if on correct page and can run script;
    onCorrectPageCheck();

    // Switch tabs to get build Id
    await openCorrectTab('overview');
    const link = $('.vc-pullrequest-leftpane-section .actionLink');

    if (link.length === 0 || link[0].innerText !== 'Build succeeded') {
      throw new Error("Can't find valid build.");
    }
    const url = new URL(link[0].href);
    // Switch tabs to get to files
    await openCorrectTab('files');
    const buildId = url.searchParams.get('buildId');
    const getArtifacsUri = `https://dev.azure.com/${organization}/${project}/_apis/build/builds/${buildId}/artifacts?api-version=5.1`;

    containerId = await getContainerId(getArtifacsUri);
    // note part after ?itemPath= need to be part to artifact with code coverage report 
    const requestUri = `https://dev.azure.com/${organization}/_apis/resources/Containers/${containerId}?itemPath=Code%20Coverage%20Report_${buildId}%2Fsummary${buildId}%2F${codeCoverageCodeName}`;

    const coverageReportXML = await getCoverageXML(requestUri);

    const mappedCoverage = getTestCoverageFromXML(coverageReportXML);

    let filteredFiles = getCommitedFileDomElements();
    if (filteredFiles.length === 0) {
      throw new Error("Can't find files to show code coverage with");
    }
    showCodeCoverageOnFile(filteredFiles, mappedCoverage);

  } catch (error) {
    console.error(error);
  }
};

main();
