import { organization, codeCoverageXmlReportName, useHtmlReport, apiBaseURL} from '../config';
import { showCodeCoverageOnFile } from './presentation/show-coverage';
import { getBuildId, getContainerId, getCoverage} from './api/requests';
import { getTestCoverageFromHTML } from './parsers/HTMLInline_AzurePipelines';
import { getTestCoverageFromXML } from './parsers/Cobertura';
import { getCommitedFileDomElements } from './parsers/Azure_Devops_Pull_Request_DOM';

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
  });

const getPullRequestNumber = () => {
  const uri = new URL(document.baseURI);
  const uriPathNames = uri.pathname.split('/');
  if (uriPathNames[uriPathNames.length - 2] !== 'pullrequest') {
    throw new Error(
      `You need to be on pull request page in order to run this script`
    );
  }
  return uriPathNames[uriPathNames.length - 1]
};

export const main = async () => {
  try {
    // Check if on correct page and can run script;
    const pullRequestNumber = getPullRequestNumber();
    // Switch to files tab
    await openCorrectTab('files');

    const buildId = await getBuildId(pullRequestNumber);
    const getArtifactsUri = `${apiBaseURL}/build/builds/${buildId}/artifacts?api-version=5.1`;

    const containerId = await getContainerId(getArtifactsUri);
    // Note part after ?itemPath= is a path to artifact with code coverage report
   
    var mappedCoverage;
    if(useHtmlReport){
      const testReportsUri = `${apiBaseURL}/test/CodeCoverage/browse/${containerId}/Code%20Coverage%20Report_${buildId}/`;
      
      const htmlSummaryPath = testReportsUri + `/index.htm`;
      const coverageReport = await getCoverage(htmlSummaryPath);
      mappedCoverage = getTestCoverageFromHTML(coverageReport, testReportsUri);
    }
    else {
      const requestUri = `https://dev.azure.com/${organization}/_apis/resources/Containers/${containerId}?itemPath=Code%20Coverage%20Report_${buildId}/summary${buildId}/${codeCoverageXmlReportName}`;

      // Get coverage xml report
      const coverageReportXML = await getCoverage(requestUri);

      // Parse and map report to object
      mappedCoverage = getTestCoverageFromXML(coverageReportXML);
    }
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