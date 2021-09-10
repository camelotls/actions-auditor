const core = require('@actions/core');
const fs = require('fs');
const { v4 } = require('uuid');
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'actions-audit' });

const jsonXform = require('@perpk/json-xform');
const { preprocessOwaspReport } = require('./utils/helpers');
const { TEMPLATE_MAPPER, AUDIT_TOOL_REPORT } = require('./utils/enums');

const REPORT_INPUT = core.getInput('REPORT_INPUT') || process.env.REPORT_INPUT;
const AUDIT_TOOL = core.getInput('AUDIT_TOOL') || process.env.AUDIT_TOOL;

let auditReportFlattened;

const tempReportInputFile = fs.readFileSync(REPORT_INPUT, 'utf8');

try {
  const report = (AUDIT_TOOL === AUDIT_TOOL_REPORT.owasp) ? preprocessOwaspReport(tempReportInputFile) : tempReportInputFile;
  fs.writeFileSync(`tmp-${AUDIT_TOOL}-report.json`, report, 'utf8');
} catch (e) {
  log.warn(e);
}

if (AUDIT_TOOL === AUDIT_TOOL_REPORT.owasp) {
  log.info('The template mapper for owasp will be used');
  const auditMapper = `${TEMPLATE_MAPPER.path}/${AUDIT_TOOL}-template-mapper.json`;
  auditReportFlattened = jsonXform.mapWithTemplate(`tmp-${AUDIT_TOOL}-report.json`, auditMapper);
}

const startAction = () => {
  let preprocessedReport = {};
  let singleIssueData;

  switch (AUDIT_TOOL) {
    case AUDIT_TOOL_REPORT.owasp:
      auditReportFlattened.site.forEach((issue) => {
        const uuid = v4().toString();
        const urls = [];
        issue.instances.forEach((instance) => { urls.push(instance.uri); });
        singleIssueData = {
          [uuid]: {
            name: issue.name || '',
            desc: issue.desc || '',
            uri: urls,
            riskdesc: issue.riskdesc || '',
            reference: issue.reference || '',
            solution: issue.solution || ''
          }
        };
        Object.assign(preprocessedReport, singleIssueData);
      });
      break;
    case AUDIT_TOOL_REPORT.npm:
      preprocessedReport = JSON.parse(tempReportInputFile).advisories;
  }
  core.setOutput('auditReport', JSON.stringify(preprocessedReport));
};

(async () => {
  startAction();
})();
