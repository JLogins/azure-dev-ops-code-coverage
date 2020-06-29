export const openFilesTab = (isPreview) => 
  {
      let selector = isPreview ? `[data-content="Files"]`: `[data-id="files"]`
        return new Promise((resolve, reject) => {
            // if ($(selector).hasClass('selected')) {
            //     resolve();
            // }
            const fileTab = document.querySelector("#__bolt-tab-files > span > span");//$(selector);//`[data-id="${tabName}"] a`);
            if (fileTab) {
                fileTab.click();
                console.log("clicked");
                setTimeout(() => resolve(), 500);
            }
            else {
                reject(new Error(`Can't find Files tab.`));
            }
        });
    };