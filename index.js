const core = require('@actions/core');
const shell = require('shelljs');
const { readdirSync, rename } = require('fs');

const MOUNTED_GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE;
const NPM_AUDIT_FOLDER_PATH = '.github/actions/npm-audit/';

const childProcessExecute = (command) => {
  console.log(`Attempting to execute ${command}...`);
  let npmAuditOutput = '';
  const { stdout, stderr } = shell.exec(command);

  if (stdout) {
    npmAuditOutput = stdout;
  } else if (stderr) {
    npmAuditOutput = stderr;
  }

  /*
     * We need to set 2 outputs:
     * - npm_audit_json: will be used by the jira-integration job
     * - npm_audit: will be used by the pull-request-commenter job
     */
  if (command.includes('json')) {
    core.setOutput('npm_audit_json', JSON.parse(npmAuditOutput).advisories);
  } else {
    core.setOutput('npm_audit', npmAuditOutput);
  }
};

const cleanUpEnvironment = () => {
  // change the directory in order to properly run the npm audit
  shell.cd(NPM_AUDIT_FOLDER_PATH);

  const files = readdirSync(__dirname);

  // rename the npm-audit specific files
  const nonRootFilteredFiles = files.filter(
    (file) => file.includes('package') && !file.includes('root')
  );
  nonRootFilteredFiles.forEach((file) => rename(file, `${file}_npm`, (err) => console.log(err)));

  // rename the root related packages
  console.log('Renaming the root related package files...');
  const rootFilteredFiles = files.filter(
    (file) => file.includes('package') && file.includes('root')
  );
  rootFilteredFiles.forEach((file) =>
    rename(file, file.replace('-root', ''), (err) => console.log(err))
  );
};

const npmAuditRunner = () => {
  const npmAuditBashCommand = 'npm audit --production';
  const npmAuditJsonBashCommand = 'npm audit --production --json';

  // call the clean up function in order to prepare the package related files for npm audit to run based on the repo root
  cleanUpEnvironment();

  childProcessExecute(npmAuditBashCommand, MOUNTED_GITHUB_WORKSPACE);
  childProcessExecute(npmAuditJsonBashCommand, MOUNTED_GITHUB_WORKSPACE);
};

npmAuditRunner();
