const core = require('@actions/core');
const fs = require('fs');
const { v4 } = require('uuid');
const jsonXform = require('@perpk/json-xform');
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'actions-audit' });
const { preprocessOwaspReport } = require('./utils/helpers');
const REPORT_INPUT = core.getInput('REPORT_INPUT') || process.env.REPORT_INPUT;
const AUDIT_TOOL = core.getInput('AUDIT_TOOL') || process.env.AUDIT_TOOL;
let auditReportFlattened;

const tempReportInputFile = fs.readFileSync(REPORT_INPUT, 'utf8');

try {
  if (AUDIT_TOOL === 'owasp') {
    const report = preprocessOwaspReport(tempReportInputFile);
    fs.writeFileSync(`tmp-${AUDIT_TOOL}-report.json`, report, 'utf8');
  } else {
    fs.writeFileSync(`tmp-${AUDIT_TOOL}-report.json`, tempReportInputFile, 'utf8');
  }
} catch (e) {
  log.warn(e);
}

if (AUDIT_TOOL === 'npm') {
  console.log('No template mapper for npm is needed');
} else {
  console.log('The template mapper for owasp will be used');
  const auditMapper = `./actions-npm-audit/templateMappers/${AUDIT_TOOL}-template-mapper.json`;
  auditReportFlattened = jsonXform.mapWithTemplate(`tmp-${AUDIT_TOOL}-report.json`, auditMapper);
}

const startAction = () => {
  let preprocessedReport = {};
  let singleIssueData;

  switch (AUDIT_TOOL) {
    case 'owasp':
      auditReportFlattened.site.forEach((issue) => {
        const uuid = v4().toString();
        singleIssueData = {
          [uuid]: {
            name: issue.name || '',
            desc: issue.desc || '',
            riskdesc: issue.riskdesc || '',
            reference: issue.reference || '',
            solution: issue.solution || ''
          }
        };
        Object.assign(preprocessedReport, singleIssueData);
      });
      break;
    case 'npm':
      preprocessedReport = JSON.parse(REPORT_INPUT).advisories;
  }
  core.setOutput('auditReport', JSON.stringify(preprocessedReport));
};

(async () => {
  startAction();
})();
