const npmAuditSchema = {
  type: 'object',
  patternProperties: {
    '^[0-9]*$': {
      type: 'object',
      properties: {
        findings: {
          type: 'array',
          items: [{
            type: 'object',
            properties: {
              version: {
                type: 'string'
              },
              paths: {
                type: 'array',
                items: [{
                  type: 'string'
                }]
              }
            },
            required: [
              'version',
              'paths'
            ]
          }]
        },
        metadata: {
          type: 'null'
        },
        vulnerable_versions: {
          type: 'string'
        },
        module_name: {
          type: 'string'
        },
        severity: {
          type: 'string'
        },
        github_advisory_id: {
          type: 'string'
        },
        cves: {
          type: 'array',
          items: {}
        },
        access: {
          type: 'string'
        },
        patched_versions: {
          type: 'string'
        },
        updated: {
          type: 'string'
        },
        recommendation: {
          type: 'string'
        },
        cwe: {
          type: 'string'
        },
        found_by: {
          type: 'null'
        },
        deleted: {
          type: 'null'
        },
        id: {
          type: 'integer'
        },
        references: {
          type: 'string'
        },
        created: {
          type: 'string'
        },
        reported_by: {
          type: 'null'
        },
        title: {
          type: 'string'
        },
        npm_advisory_id: {
          type: 'null'
        },
        overview: {
          type: 'string'
        },
        url: {
          type: 'string'
        }
      },
      required: [
        'findings',
        'metadata',
        'vulnerable_versions',
        'module_name',
        'severity',
        'github_advisory_id',
        'cves',
        'access',
        'patched_versions',
        'updated',
        'recommendation',
        'cwe',
        'found_by',
        'deleted',
        'id',
        'references',
        'created',
        'reported_by',
        'title',
        'npm_advisory_id',
        'overview',
        'url'
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
