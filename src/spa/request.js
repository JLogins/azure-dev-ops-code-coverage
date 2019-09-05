import { branchName, organization, project, codeCoverageCodeName } from '../../config';

const apiBaseURL = `https://dev.azure.com/${organization}/${project}/_apis`

const getContainerId = getArtifactsUri =>
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

const getCoverageXML = requestUri =>
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

const getTestCoverageFromXML = coverageReportXML => {
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

const getCommitedFileDomElements = () => {
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

const getBuildId=(pullRequestNr) => 
new Promise((resolve, reject) => {
  $.ajax({
    url: `${apiBaseURL}/build/builds?resultFilter=succeeded&reasonFilter=pullRequest&queryOrder=finishTimeDescending&$top=1&branchName=refs/pull/${pullRequestNr}/merge&api-version=5.1`
  }).done(data => {
    if(data && data.value && data.value.length > 0){
      return resolve(data.value[0].id);
    }
    return reject(new Error('Can\'t find valid build!'))
  })
})

const openCorrectTab = tabName => 
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

const getPullRequestNumber = () => {
  const uri = new URL(document.baseURI);
  const uriPathNames = uri.pathname.split('/');
  if (uriPathNames[uriPathNames.length - 2] !== 'pullrequest') {
    throw new Error(
      `You need to be in ${branchName} pull request in order to run this script`
    );
  }
  return uriPathNames[uriPathNames.length - 1]
};

const showCodeCoverageOnFile = (files, codeCoverage) => {
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
      coverageInfo.innerText = ` L: ${fileCodeCoverage.lineCoverage}% B: ${fileCodeCoverage.branchCoverage}%`
      file.appendChild(coverageInfo);
    }
  })
}

export const main = async () => {
  try {
    // Check if on correct page and can run script;
    const pullRequestNumber = getPullRequestNumber();
    // Switch to files tab
    await openCorrectTab('files');
    const buildId = await getBuildId(pullRequestNumber);// url.searchParams.get('buildId');
    const getArtifactsUri = `${apiBaseURL}/build/builds/${buildId}/artifacts?api-version=5.1`;

    const containerId = await getContainerId(getArtifactsUri);
    // Note part after ?itemPath= need to be part to artifact with code coverage report 
    const requestUri = `https://dev.azure.com/${organization}/_apis/resources/Containers/${containerId}?itemPath=Code%20Coverage%20Report_${buildId}%2Fsummary${buildId}%2F${codeCoverageCodeName}`;

    // Get coverage xml report
    const coverageReportXML = await getCoverageXML(requestUri);

    // Parse and map report to object
    const mappedCoverage = getTestCoverageFromXML(coverageReportXML);

    // Get Files from page
    let filteredFiles = getCommitedFileDomElements();
    if (filteredFiles.length === 0) {
      throw new Error("Can't find files to show code coverage with");
    }

    // Display code coverage
    showCodeCoverageOnFile(filteredFiles, mappedCoverage);
  } catch (error) {
    console.error(error);
  }
};
