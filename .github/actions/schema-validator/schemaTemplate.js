const npmAuditSchema = {
  type: 'object',
  patternProperties: {
    '^[0-9A-Za-z\s\-]+$': {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        severity: {
          type: 'string'
        },
        isDirect: {
          type: 'boolean'
        },
        via: {
          type: 'array',
          items: [
            {
              type: ['object', 'string']
            }
          ]
        },
        effects: {
          type: 'array',
          items: [
            {
              type: 'string'
            }
          ]
        },
        range: {
          type: 'string'
        },
        nodes: {
          type: 'array',
          items: [
            {
              type: 'string'
            }
          ]
        },
        fixAvailable: {
          type: 'boolean'
        }
      },
      required: [
        'name',
        'severity',
        'isDirect',
        'via',
        'effects',
        'range',
        'nodes',
        'fixAvailable'
      ]
    }
  },
  required: true,
  additionalProperties: false,
  id: 'npm'
};

const owaspAuditSchema = {
  type: 'object',
  patternProperties: {
    '^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}$': {
      type: 'object',
      properties: {
        name: {
          type: 'string'
        },
        desc: {
          type: 'string'
        },
        uri: {
          type: 'array',
          items: [{
            type: 'string'
          },
          {
            type: 'string'
          },
          {
            type: 'string'
          },
          {
            type: 'string'
          },
          {
            type: 'string'
          },
          {
            type: 'string'
          },
          {
            type: 'string'
          },
          {
            type: 'string'
          },
          {
            type: 'string'
          },
          {
            type: 'string'
          },
          {
            type: 'string'
          },
          {
            type: 'string'
          }
          ]
        },
        riskdesc: {
          type: 'string'
        },
        reference: {
          type: 'string'
        },
        solution: {
          type: 'string'
        }
      },
      required: [
        'name',
        'desc',
        'uri',
        'riskdesc',
        'reference',
        'solution'
      ]
    }
  },
  required: true,
  additionalProperties: false,
  id: 'owasp'
};

module.exports = { npmAuditSchema, owaspAuditSchema };
