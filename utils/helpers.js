const preprocessOwaspReport = (inputFile) => {
  const report = inputFile.replace(/<.+?>/g, '');
  return report;
};
module.exports = { preprocessOwaspReport };
