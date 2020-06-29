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

  export const getBuildIdXHR = pullRequestNr =>
  new Promise((resolve, reject) => {
    //fug, ajax not defined
    var xhr = new XMLHttpRequest();
    console.log("Getting build id");
    xhr.open('GET', `${apiBaseURL}/build/builds?resultFilter=succeeded&reasonFilter=pullRequest&queryOrder=finishTimeDescending&$top=1&branchName=refs/pull/${pullRequestNr}/merge&api-version=5.1`);
    xhr.onload = () => 
    {
      if (xhr.status === 200) {
        console.log('Build id retrieved successfully');
        return resolve(JSON.parse(xhr.responseText).value[0].id);
      }
      return reject(new Error('Can\'t find valid build!'));
    };
    xhr.send();
  });

  export const getContainerIdXHR = buildArtifactsUri =>
  new Promise((resolve, reject) => {
    console.log("Getting container id");
    var xhr = new XMLHttpRequest();
    xhr.open('GET', buildArtifactsUri);
    xhr.onload = () => {
      if(xhr.status === 200){

        let z = JSON.parse(xhr.responseText).value[0].resource;
        console.log('Container id retrieved')
        return resolve(z.data.split('/')[1]);
      }
        console.error(buildArtifactsUri); //what a mess
        return reject(xhr.Status);
    };
    xhr.send();
  });

export const getContainerId = buildArtifactsUri =>
  new Promise((resolve, reject) => {
    console.log("Getting container id");
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

  export const getCoverageXHR = requestUri =>
  new Promise((resolve, reject) => {
    console.log("Getting coverage data");
    var xhr = new XMLHttpRequest();
    xhr.open('GET', requestUri);
    xhr.onload = () => {
      if(xhr.status === 200){
        //console.log(xhr.responseText);
        return resolve(xhr.responseText);
      }
        console.error(requestUri);
        reject(xhr.status);
    };
    
    xhr.send();
  });

export const getCoverage = requestUri =>
  new Promise((resolve, reject) => {
    console.log("Getting coverage data");
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