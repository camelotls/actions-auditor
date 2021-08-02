const OwaspAudit = function (inputJson, site, alerts)  {
    const { solution, reference } = inputJson[site];
    const {name, riskdesc, desc } = inputJson[site][0][alerts];

    this.solution = solution;
    this.reference = reference;
    this.name = name;
    this.riskdesc = riskdesc;
    this.desc = desc;
};

module.exports = OwaspAudit;
