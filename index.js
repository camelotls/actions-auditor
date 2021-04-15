const core = require('@actions/core');
const shell = require('shelljs');
const dirtyJSON = require('dirty-json');
const Validator = require('jsonschema').Validator;
const { readdirSync, rename } = require('fs');

const AUDIT_COMMAND = core.getInput('AUDIT_COMMAND');
const JSON_DRILLER = core.getInput('JSON_DRILLER');

const jsonValidator = new Validator();

const cleanUpEnvironment = () => {
  // change the directory in order to properly run the audit command
  shell.cd(`${process.env.GITHUB_WORKSPACE}/${process.env.ACTION_NAME}`);

  const files = readdirSync(__dirname);

  // rename the audit-specific files
  const nonRootFilteredFiles = files.filter(
    (file) => file.includes('package') && !file.includes('root')
  );
  nonRootFilteredFiles.forEach((file) => rename(file, `${file}_audit`, (err) => console.log(err)));

  // rename the root related packages
  console.log('Renaming the root related package files...');
  const rootFilteredFiles = files.filter(
    (file) => file.includes('package') && file.includes('root')
  );

  rootFilteredFiles.forEach((file) =>
    rename(file, file.replace('-root', ''), (err) => console.log(err))
  );
};

const actionRunner = (AUDIT_COMMAND) => {
  console.log('Prepare the container for the audit...');
  cleanUpEnvironment();

  console.log(`Attempting to execute ${AUDIT_COMMAND}...`);
  let auditCommandOutput = '';
  const auditCommand = AUDIT_COMMAND;

  const {
    stdout,
    stderr
  } = shell.exec(auditCommand);

  if (stdout) {
    console.log('Command executed successfully!');
    auditCommandOutput = stdout;
  } else if (stderr) {
    console.log(`Command execution encountered the following error: ${stderr}`);
    auditCommandOutput = stderr;
  }

  const finalData = {};

  const formattedOutput = dirtyJSON.parse(auditCommandOutput);

  function extractJSON (formattedOutput) {
    for (const i in formattedOutput) {
      if (Array.isArray(formattedOutput[i]) || typeof formattedOutput[i] === 'object') {
        extractJSON(formattedOutput[i]);
      } else if (i === 'id') {
        finalData[i] = formattedOutput[i];
        return finalData;
      }
    }
  }

  extractJSON(formattedOutput);

  core.setOutput('audit_command_output', JSON.parse(auditCommandOutput)[JSON_DRILLER]);
};

(async () => {
  actionRunner(AUDIT_COMMAND);
})();
