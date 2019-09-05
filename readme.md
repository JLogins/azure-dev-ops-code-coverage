# Plug in for azure dev ops
## Motivation
For my project we had an issue where code coverage was available only in build report as an artifact. It was really hard to map code coverage with commited files and see if it was below set norm.
Together with colleague we came up with idea to create script that will pull up report from azure and map it to files and display code coverage next to file names.

## Install
1. Install node modules
```bash
npm install
```
2. Rename `config.template.js` to `config.js` and set up your config variables.
3. `npm run build` to build minified dist file
4. `npm run dev` to build development version
5. Copy generated file and run on pull request page.

## Contributor
Germans Gruseckis
Janis Logins
