import { organization, codeCoverageXmlReportName, useHtmlReport, apiBaseURL} from '../config';
import { showCodeCoverageOnFile } from './presentation/show-coverage';
import { getBuildId, getContainerId, getCoverage, getBuildIdXHR, getCoverageXHR, getContainerIdXHR} from './api/requests';
import { getTestCoverageFromHTML } from './parsers/HTMLInline_AzurePipelines';
import { getTestCoverageFromXML } from './parsers/Cobertura';
import { getCommitedFileDomElements } from './parsers/Azure_Devops_Pull_Request_DOM';
import { openFilesTab } from './utils';
import { getCommitedFileDomElementsPreview } from './parsers/Azure_Devops_Pull_Request_DOM_PREVIEW';

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
    
    //await openCorrectTab('files');
    await openFilesTab(true);

    const buildId = await getBuildIdXHR(pullRequestNumber);//await getBuildId(pullRequestNumber);
    const getArtifactsUri = `${apiBaseURL}/build/builds/${buildId}/artifacts?api-version=5.1`;

    const containerId = await getContainerIdXHR(getArtifactsUri);
    // Note part after ?itemPath= is a path to artifact with code coverage report
   
    var mappedCoverage;
    if(useHtmlReport){
      const testReportsUri = `${apiBaseURL}/test/CodeCoverage/browse/${containerId}/Code%20Coverage%20Report_${buildId}/`;
      
      const htmlSummaryPath = testReportsUri + `/index.htm`;
      const coverageReport = await getCoverageXHR(htmlSummaryPath);
      mappedCoverage = getTestCoverageFromHTML(coverageReport, testReportsUri);
    }
    else {
      const requestUri = `https://dev.azure.com/${organization}/_apis/resources/Containers/${containerId}?itemPath=Code%20Coverage%20Report_${buildId}/summary${buildId}/${codeCoverageXmlReportName}`;

      // Get coverage xml report
      const coverageReportXML = await getCoverageXHR(requestUri);

      // Parse and map report to object
      mappedCoverage = getTestCoverageFromXML(coverageReportXML);
    }
    // Get Files from page
    let filteredFiles = getCommitedFileDomElementsPreview();//getCommitedFileDomElements()
    if (filteredFiles.length === 0) {
      throw new Error("Can't find files to show code coverage with");
    }

    // Display code coverage
    showCodeCoverageOnFile(filteredFiles, mappedCoverage);
  } catch (error) {
    console.error(error);
  }
};