import { apiBaseURL } from '../../config';

export const getBuildId = pullRequestNr =>
  new Promise((resolve, reject) => {
    $.ajax({
      url: `${apiBaseURL}/build/builds?resultFilter=succeeded&reasonFilter=pullRequest&queryOrder=finishTimeDescending&$top=1&branchName=refs/pull/${pullRequestNr}/merge&api-version=5.1`
    }).done(data => {
      if (data && data.value && data.value.length > 0) {
        return resolve(data.value[0].id);
      }
      return reject(new Error('Can\'t find valid build!'))
    })
  });

export const getContainerId = buildArtifactsUri =>
  new Promise((resolve, reject) => {
    $.ajax({
      url: buildArtifactsUri
    })
      .done(data => {
        resolve(data.value[0].resource.data.split('/')[1]);
      })
      .error(error => {
        console.error(error);
        reject(error);
      });
  });

export const getCoverage = requestUri =>
  new Promise((resolve, reject) => {
    $.ajax({
      url: requestUri
    })
      .done(data => {
        resolve(data);
      })
      .error(error => {
        console.error(error);
        reject(error);
      });
  });