# npm Audit GitHub Action

## Workflow Status
![Build Status](https://github.com/camelotls/actions-npm-audit/workflows/Lint%20Code%20Base/badge.svg)
![Build Status](https://github.com/camelotls/actions-npm-audit/workflows/ESLinter/badge.svg)
![Build Status](https://github.com/camelotls/actions-npm-audit/workflows/CodeQL/badge.svg)

## Action description
This action executes `npm audit` for a given repo and outputs the result either in a text or a JSON format. The latter can be used as an input to repporting tools such as the [Jira Integration Action](https://github.com/camelotls/actions-jira-integration).

## Usage
### Inputs
N/A

### Outputs
|Variable|Description|
|:--:|:--:|
|npm_audit|Result of 'npm audit --production' command on the root.|
|npm_audit_json|Result of 'npm audit --production --json' command on the root|

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
            - name: Prepare files
              run: |
                cp package.json ${GITHUB_WORKSPACE}/.github/actions/npm-audit/package-root.json
                cp package-lock.json ${GITHUB_WORKSPACE}/.github/actions/npm-audit/package-lock-root.json
            - name: Execute npm audit
              id: npm_audit
              uses: ./.github/actions/npm-audit
            -  name: Checkout Jira integration GitHub Action Repo
               uses: actions/checkout@v2
               with:
                repository: camelotls/actions-jira-integration
                ref: v1.3.0
                token: ${{ secrets.MACHINEUSER_GITHUB_TOKEN }}
                path: actions-jira-integration
            -  name: Jira ticket creation
               id: jira_integration
               uses: ./actions-jira-integration/
               with:
                  JIRA_USER: ${{ secrets.JIRA_USER }}
                  JIRA_PASSWORD: ${{ secrets.JIRA_PASSWORD }}
                  INPUT_JSON: ${{ steps.npm_audit.outputs.npm_audit_json }}
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
