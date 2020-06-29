import { classFileExtension, excludeFilesContaining } from '../../config';

const isAllowedFilename = filename => {
    return filename.includes(classFileExtension, filename.length - classFileExtension.length)
        && !filename.includes(excludeFilesContaining, filename.length - classFileExtension.length - excludeFilesContaining.length);
};

export const getCommitedFileDomElementsPreview = () => {
    const filteredFiles = [];
    const allFiles = document.getElementsByClassName("bolt-table-cell-content flex-row flex-center");


    for (let i = 0; i < allFiles.length; i++) {
        let parsedFileName = allFiles[i].getElementsByClassName('text-ellipsis')[0];

          if (parsedFileName && isAllowedFilename(parsedFileName.firstChild.innerText)) {
            filteredFiles.push(allFiles[i]);
        }
    }
    console.info(`Files to append to found: ${filteredFiles.length}`);
    return filteredFiles;
};