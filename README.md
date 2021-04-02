# Audit GitHub Action

## Workflow Status
![Build Status](https://github.com/camelotls/actions-npm-audit/workflows/Lint%20Code%20Base/badge.svg)
![Build Status](https://github.com/camelotls/actions-npm-audit/workflows/ESLinter/badge.svg)
![Build Status](https://github.com/camelotls/actions-npm-audit/workflows/CodeQL/badge.svg)

## Action description
This action executes any audit command for a given repo and outputs the result either in JSON format. The output can be used as an input to reporting tools such as the [Jira Integration Action](https://github.com/camelotls/actions-jira-integration).

## Usage
### Inputs
|Variable|Required|Description|
|:--:|:--:|:--:|
|AUDIT_COMMAND|true|The audit command to run in a given repo|
|JSON_DRILLER|true|The JSON key chain formatting the final audit_command_output value|

### Outputs
|Variable|Description|
|:--:|:--:|
|audit_command_output|Result of the execution of the input audit command on the root|

## Example workflow
To use this action in your workflow you can have a look at the following sample workflow integrating it:

```
name: Vulnerability Checker

on:
    pull_request:

jobs:
    cleanup:
        name: 'Cleanup workspace'
        runs-on: aws-core-runner
        steps:
            - name: Cleanup workspace
              run: |
                  echo "Cleaning up previous run"
                  rm -rf "${{ github.workspace }}"
    main:
        needs: [cleanup]
        name: 'Validating npm dependencies and creating Jira tickets per vulnerability'
        runs-on: aws-core-runner
        steps:
            - name: Checkout uk-mobile repo
              uses: actions/checkout@v2
            - name: Use Node.js 12.x
              uses: actions/setup-node@v1
              with:
                node-version: 12.x
            - name: Checkout npm audit repo
              uses: actions/checkout@v2
              with:
                repository: camelotls/actions-npm-audit
                ref: v1.0.0
                token: ${{ secrets.MACHINEUSER_GITHUB_TOKEN }}
                path: actions-npm-audit
            -  name: Prepare files
               run: |
                    cp package.json ${GITHUB_WORKSPACE}/actions-npm-audit/package-root.json
                    cp package-lock.json ${GITHUB_WORKSPACE}/actions-npm-audit/package-lock-root.json
            - name: Run npm Audit
              id: npm_audit
              uses: ./actions-npm-audit/
              with:
                AUDIT_COMMAND: 'npm audit --production --json'
                JSON_DRILLER: 'advisories'
            - name: Create a comment on a PR
              if: ${{ always() }}
              uses: ./.github/actions/pull-request-commenter
              with:
                MACHINEUSER_GITHUB_TOKEN: ${{ secrets.MACHINEUSER_GITHUB_TOKEN }}
                NPM_AUDIT: ${{ steps.npm_audit.outputs.audit_command_output }}
            -  name: Checkout Jira integration GitHub Action Repo
               uses: actions/checkout@v2
               with:
                repository: camelotls/actions-jira-integration
                ref: v1.4.1
                token: ${{ secrets.MACHINEUSER_GITHUB_TOKEN }}
                path: actions-jira-integration
            -  name: Jira ticket creation
               id: jira_integration
               uses: ./actions-jira-integration/
               with:
                  JIRA_USER: ${{ secrets.JIRA_USER }}
                  JIRA_PASSWORD: ${{ secrets.JIRA_PASSWORD }}
                  INPUT_JSON: ${{ steps.npm_audit.outputs.audit_command_output }}
                  JIRA_PROJECT: MBIL
                  JIRA_URI: 'jira.camelot.global'
                  REPORT_INPUT_KEYS: |
                                          vulnerabilityName: {{module_name}}
                                          issueSummary: npm-audit: {{module_name}} module vulnerability
                                          issueDescription: *Recommendation*:\r\n{{recommendation}} \r\n \r\n *Details for {{cwe}}*\r\n _Vulnerable versions_: \r\n {{vulnerable_versions}} \r\n \r\n _Patched versions_:\r\n{{patched_versions}} \r\n \r\n *Overview*\r\n{{overview}} \r\n \r\n *References*\r\n{{url}}
                                          issueSeverity: {{severity}}
                  JIRA_ISSUE_TYPE: 'Security Vulnerability'
                  RUNS_ON_GITHUB: true
                  PRIORITY_MAPPER: |
                                          critical: P1
                                          high: P2
                                          moderate: P3
                                          low: P4
                  ISSUE_LABELS_MAPPER: 'Security,Triaged,npm_audit_check'
            - name: Get actions' user id
              id: get_uid
              run: |
                actions_user_id=`id -u $USER`
                echo $actions_user_id
                echo ::set-output name=uid::$actions_user_id
            - name: Correct Ownership in GITHUB_WORKSPACE directory
              uses: peter-murray/reset-workspace-ownership-action@v1
              with:
                user_id: ${{ steps.get_uid.outputs.uid }}
```
