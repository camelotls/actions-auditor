const core = require('@actions/core');
const fs = require('fs');
const { v4 } = require('uuid');
const jsonXform = require('@perpk/json-xform');
const bunyan = require('bunyan');
const dirtyJSON = require('dirty-json');
const log = bunyan.createLogger({ name: 'actions-audit' });
const { preprocessYarnReport, preprocessOwaspReport } = require('./utils/helpers');
const REPORT_INPUT =  process.env.REPORT_INPUT;
const AUDIT_TOOL =  process.env.AUDIT_TOOL;
let auditReportFlattened;



try {
  if (AUDIT_TOOL === 'yarn') {
    const dataSet = preprocessYarnReport(REPORT_INPUT);
    fs.writeFileSync(`tmp-${AUDIT_TOOL}-report.json`, dataSet, 'utf8');
  } else if (AUDIT_TOOL === 'owasp') {
    const report = preprocessOwaspReport(REPORT_INPUT);
    fs.writeFileSync(`tmp-${AUDIT_TOOL}-report.json`, report, 'utf8');
  } else {
    fs.writeFileSync(`tmp-${AUDIT_TOOL}-report.json`, REPORT_INPUT, 'utf8');
  }
} catch (e) {
  log.warn(e);
}

if (AUDIT_TOOL === 'npm') {
  console.log('No template mapper for npm is needed');
} else if ((AUDIT_TOOL === 'yarn')) {
  console.log("The template mapper for yarn will be used")
  const auditMapper = `./actions-npm-audit/templateMappers/${AUDIT_TOOL}-template-mapper.json`;
  auditReportFlattened = jsonXform.mapWithTemplate(`tmp-${AUDIT_TOOL}-report.json`, auditMapper);
} else {
  console.log("The template mapper for owasp will be used")
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
      break;
    case 'yarn':
      auditReportFlattened.dataSet.forEach((issue) => {
        const uuid = v4().toString();
        singleIssueData = {
          [uuid]: {
            title: issue.title || '',
            module_name: issue.module_name || '',
            overview: issue.overview || '',
            recommendation: issue.recommendation || '',
            references: issue.references || '',
            severity: issue.severity || ''
          }
        };
        Object.assign(preprocessedReport, singleIssueData);
      });
  }
     core.setOutput('auditReport', JSON.stringify(preprocessedReport));
   // console.log(JSON.stringify(preprocessedReport));
};

(async () => {
  startAction();
})();
