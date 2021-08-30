function preprocessYarnReport(inputFile) {
  const report = '['.concat( inputFile.replace(/} {/g, '},{')).concat(']');
  const filteredReport =  JSON.parse(report).filter(issue => {
      return issue.type !== 'auditSummary';
  });
  const finalReport = '{"dataSet":'.concat(JSON.stringify(filteredReport)).concat('}');
  return finalReport;
}

function preprocessOwaspReport(inputFile) {
  const report = inputFile.replace(/<.+?>/g ,'');
  return report;
}
module.exports = { preprocessYarnReport, preprocessOwaspReport };
