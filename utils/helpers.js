function preprocessYarnReport(inputFile) {
  const report = '['.concat( inputFile.replace(/} {/g, '},{')).concat(']');
  const filteredReport =  JSON.parse(report).filter(issue => {
      return issue.type !== 'auditSummary';
  });
  const finalReport = '{"dataSet":'.concat(JSON.stringify(filteredReport)).concat('}');
  return finalReport;
}
module.exports = { preprocessYarnReport };
