import { classFileExtension, excludeFilesContaining } from '../../config';

const isAllowedFilename = filename => {
    return filename.includes(classFileExtension, filename.length - classFileExtension.length)
        && !filename.includes(excludeFilesContaining, filename.length - classFileExtension.length - excludeFilesContaining.length);
};

export const getCommitedFileDomElements = () => {
    const filteredFiles = [];
    const allFiles = $('div.vc-tree-cell');

    for (let i = 0; i < allFiles.length; i++) {
        if (isAllowedFilename(allFiles[i].attributes['aria-label'].value)) {
            allFiles[i].attributes['content'].value = allFiles[i].attributes['content'].value.split(' ')[0].replace(/\//gi, ".")
            filteredFiles.push(allFiles[i]);
        }
    }
    console.info(`Files to append to found: ${filteredFiles.length}`);
    return filteredFiles;
};