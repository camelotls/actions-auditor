const core = require('@actions/core');
const fs = require('fs');
const jsonParser = require('./utils/jsonParserFactory');
const { v4 } = require('uuid');
const _ = require('lodash');
const jsonXform  = require('@perpk/json-xform');
const util = require('util');
const bunyan = require('bunyan');

const REPORT_INPUT = process.env.REPORT_INPUT;
const AUDIT_TOOL = process.env.AUDIT_TOOL;
let auditReportFlattened;

// console.log(util.inspect(jsonXform.mapWithTemplate(`owasp-report.json`, 'templateMappers/owasp-template-mapper.json')), false, null,true);

try {
    fs.writeFileSync(`tmp-${AUDIT_TOOL}-report.json`, REPORT_INPUT, 'utf8');
} catch(e) {
    log.warn(e);
}

if(AUDIT_TOOL === 'npm') {
    console.log('No template mapper for npm is needed...');
} else {
    const auditMapper = `templateMappers/${AUDIT_TOOL}-template-mapper.json`;
      auditReportFlattened = jsonXform.mapWithTemplate(`tmp-${AUDIT_TOOL}-report.json`, auditMapper);

}

 const startAction = () => {
    let preprocessedReport = {};
    let singleIssueData;

    switch (AUDIT_TOOL) {
        case 'owasp':
            auditReportFlattened['site'].forEach((flattenedIssue) => {
                flattenedIssue['alerts'].forEach((issue) => {
                    const uuid = v4().toString();
                    singleIssueData = {
                        [uuid]: {
                            name: issue.name || '',
                            desc: issue.desc || '',
                            riskdesc: issue.riskdesc || '',
                            reference: issue.reference || '',
                            solution: issue.solution || '',
                        }
                    };
                });
            });
            Object.assign(preprocessedReport, singleIssueData);
            break;
        case 'npm':
             preprocessedReport = JSON.parse(REPORT_INPUT).advisories;
            break;
    }

    // core.setOutput('auditReport', preprocessedReport);
    console.log(preprocessedReport);
};

(async () => {
    startAction();
})();
