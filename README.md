# Audit GitHub Action

## Workflow Status
![Build Status](https://github.com/camelotls/actions-auditor/workflows/Lint%20Code%20Base/badge.svg)
![Build Status](https://github.com/camelotls/actions-auditor/workflows/ESLinter/badge.svg)
![Build Status](https://github.com/camelotls/actions-auditor/workflows/CodeQL/badge.svg)

## Action description
This action receives a report in JSON format and process it.
The output is a new JSON report that can be used as an input to reporting tools such as the [Jira Integration Action](https://github.com/camelotls/actions-jira-integration).

## Usage
### Inputs
|Variable|Required|Description|
|:--:|:--:|:--:|
|AUDIT_TOOL|true|The audit tool report type that will be processed by the Auditor.|
|REPORT_INPUT|true|The path where the JSON report is located.|

### Outputs
|Variable|Description|
|:--:|:--:|
|audit_command_output|Result of the execution of the input audit command on the root|

## Example workflow
To use this action in your workflow you can have a look at the following sample workflow integrating it:

```
name: NPM-Audit

# Controls when the action will run. Every night at 22.30 pm
on: push
  #schedule:
  #  - cron: "30 22 * * 1-5"

jobs:
  cleanup:
    name: "Cleanup workspace"
    runs-on: aws-core-runner
    steps:
      - name: Cleanup workspace
        run: |
          echo "Cleaning up previous run"
          rm -rf "${{ github.workspace }}"
  main:
    needs: [cleanup]
    name: "Validate npm dependencies and creating Jira tickets per vulnerability"
    runs-on: aws-core-runner
    steps:
      - name: Checkout ill-mobile repo
        uses: actions/checkout@v2

      - name: Use Node.js 12.x
        uses: actions/setup-node@v1
        with:
          node-version: 12.x

      - name: Prepare files
        run: |
          cp build/package.template.json ./package.json
      - name: Run npm audit
        if: always()
        run: npm audit --production --json > audit.json

      - name: Upload NPM audit report to GH Artifact
        if: always()
        uses: actions/upload-artifact@v2.2.4
        with:
          name: "NPM_Audit_Mobile_Report.zip"
          path: |
            ./audit.json
      - name: Checkout auditor
        if: always()
        uses: actions/checkout@v2
        with:
          repository: camelotls/actions-auditor
          ref: v2.1.1
          token: ${{ secrets.MACHINEUSER_GITHUB_TOKEN }}
          path: actions-auditor

      - name: Copy report to Auditor repo
        if: always()
        run: cp ./audit.json ./actions-auditor/

      - name: Audit checker
        if: always()
        id: npm_audit
        uses: ./actions-auditor/
        with:
          REPORT_INPUT: "./actions-auditor/audit.json"
          AUDIT_TOOL: "npm"

      - name: Checkout Jira integration GitHub Action Repo
        if: always()
        uses: actions/checkout@v2
        with:
          repository: camelotls/actions-jira-integration
          ref: v2.1.0
          token: ${{ secrets.MACHINEUSER_GITHUB_TOKEN }}
          path: actions-jira-integration

      - name: Jira ticket creation
        if: always()
        id: jira_integration
        uses: ./actions-jira-integration/
        env:
          ISSUE_TYPE: "Security Vulnerability"
          ISSUE_LABELS_MAPPER: "npm-audit-mobile"
          JIRA_PROJECT: ILL
          JIRA_URI: "jira.camelot.global"
          LOAD_BALANCER_COOKIE_NAME: "AWSALB"
        with:
          JIRA_USER: ${{ secrets.JIRA_USER }}
          JIRA_PASSWORD: ${{ secrets.JIRA_PASSWORD }}
          INPUT_JSON: ${{ steps.npm_audit.outputs.auditReport }}
          JIRA_PROJECT: ${{ env.JIRA_PROJECT }}
          JIRA_URI: ${{ env.JIRA_URI }}
          REPORT_INPUT_KEYS: |
            issueName: {{module_name}}
            issueSummary: mobile-npm-audit: {{module_name}} module vulnerability
            issueDescription: *Recommendation*:\r\n{{recommendation}} \r\n \r\n *Details for {{cwe}}*\r\n _Vulnerable versions_: \r\n {{vulnerable_versions}} \r\n \r\n _Patched versions_:\r\n{{patched_versions}} \r\n \r\n *Overview*\r\n{{overview}} \r\n \r\n *References*\r\n{{url}}
            issueSeverity: {{severity}}
          JIRA_ISSUE_TYPE: ${{ env.ISSUE_TYPE }}
          RUNS_ON_GITHUB: true
          PRIORITY_MAPPER: |
            critical: P1
            high: P2
            moderate: P3
            low: P4
          ISSUE_LABELS_MAPPER: ${{ env.ISSUE_LABELS_MAPPER }}
          LOAD_BALANCER_COOKIE_ENABLED: true
          LOAD_BALANCER_COOKIE_NAME: ${{ env.LOAD_BALANCER_COOKIE_NAME }}
          JQL_SEARCH_PAYLOAD_RESOLVED_ISSUES: 'project=${{ env.JIRA_PROJECT }} AND type="${{ env.ISSUE_TYPE }}" AND labels IN (${{ env.ISSUE_LABELS_MAPPER }}) AND status=Done AND resolution IN (Obsolete,Duplicate,"Won''t Do")'
          JQL_SEARCH_PAYLOAD_OPEN_ISSUES: 'project=${{ env.JIRA_PROJECT }} AND type="${{ env.ISSUE_TYPE }}" AND labels IN (${{ env.ISSUE_LABELS_MAPPER }}) AND status NOT IN (Done)'

      - name: Get actions' user id
        if: always()
        id: get_uid
        run: |
          actions_user_id=`id -u $USER`
          echo $actions_user_id
          echo ::set-output name=uid::$actions_user_id
      - name: Correct Ownership in GITHUB_WORKSPACE directory
        if: always()
        uses: peter-murray/reset-workspace-ownership-action@v1
        with:
          user_id: ${{ steps.get_uid.outputs.uid }}
```
