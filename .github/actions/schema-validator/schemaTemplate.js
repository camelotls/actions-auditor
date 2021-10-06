const npmAuditSchema = {
  type: 'object',
  patternProperties: {
    '^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}$': {
      type: 'object',
      properties: {
        findings: {
          type: 'array',
          items: [
            {
              type: 'object',
              properties: {
                version: {
                  type: 'string'
                },
                paths: {
                  type: 'array',
                  items: [
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
                }
              },
              required: [
                'version',
                'paths'
              ]
            }
          ]
        },
        found_by: {
          type: 'object',
          properties: {
            link: {
              type: 'string'
            },
            name: {
              type: 'string'
            }
          },
          required: [
            'link',
            'name'
          ]
        },
        module_name: {
          type: 'string'
        },
        reported_by: {
          type: 'object',
          properties: {
            link: {
              type: 'string'
            },
            name: {
              type: 'string'
            }
          },
          required: [
            'link',
            'name'
          ]
        },
        cves: {
          type: 'array',
          items: {}
        },
        references: {
          type: 'string'
        },
        updated: {
          type: 'string'
        },
        id: {
          type: 'integer'
        },
        deleted: {
          type: 'null'
        },
        severity: {
          type: 'string'
        },
        created: {
          type: 'string'
        },
        metadata: {
          type: 'object',
          properties: {
            module_type: {
              type: 'string'
            },
            exploitability: {
              type: 'integer'
            },
            affected_components: {
              type: 'string'
            }
          },
          required: [
            'module_type',
            'exploitability',
            'affected_components'
          ]
        },
        vulnerable_versions: {
          type: 'string'
        },
        overview: {
          type: 'string'
        },
        cwe: {
          type: 'string'
        },
        patched_versions: {
          type: 'string'
        },
        title: {
          type: 'string'
        },
        recommendation: {
          type: 'string'
        },
        access: {
          type: 'string'
        },
        url: {
          type: 'string'
        }
      },
      required: [
        'findings',
        'found_by',
        'module_name',
        'reported_by',
        'cves',
        'references',
        'updated',
        'id',
        'deleted',
        'severity',
        'created',
        'metadata',
        'vulnerable_versions',
        'overview',
        'cwe',
        'patched_versions',
        'title',
        'recommendation',
        'access',
        'url'
      ]
    }
  },
  required: true,
  additionalProperties: false,
  id: 'npm'
}



module.exports = { npmAuditSchema };
