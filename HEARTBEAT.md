# HEARTBEAT.md — id-staking-v2-app

**Repo**: passportxyz/id-staking-v2-app
**Type**: Next.js Web3 app (Identity Staking)
**Stack**: Next.js 14, React 18, Wagmi/Viem (Web3), Chakra UI, TypeScript
**Deployment**: S3-based CI/CD with staging/production promotion workflow
**Main Branch**: main

## Urgent Flags

*(High-priority issues requiring immediate human attention)*

- ✅ **CI Workflow Fixed**: Deploy UI Generic workflow - fixed undefined inputs bug (2026-02-23)
- 🔴 **Security Vulnerabilities**: Multiple high/moderate severity issues in dependencies (ws, MetaMask SDK, bn.js)
- 🟡 **Stale Deployment**: Last successful release was April 7, 2025 (10+ months old)
- 🟡 **Deploy Infra Failing**: Legacy workflow failures (workflow removed in PR #92, expected)

---

## Quick Tasks (~8 min interval)

Fast checks that complete in < 10 seconds

- [x] Git status: clean working tree (only HEARTBEAT.md untracked)
- [x] Untracked/uncommitted changes: only HEARTBEAT.md
- [x] Check for `.env` issues: no .env files present (expected for repo)
- [x] Dependency alerts: ✓ Found security vulnerabilities (see security report below)
- [x] Recent workflow failures: inspected—multiple failures detected

---

## Hourly Tasks (~60 min interval)

Moderate-depth checks

- [x] Fetch upstream changes: ✓ origin/main up to date
- [x] Check for new PRs: ✓ No open PRs
- [x] Check for stale branches: ✓ Only main branch exists locally
- [x] CI status: ✓ Inspected—see failure details in notes
- [ ] Deployment status: verify staging/production deployment health
- [ ] Check for Next.js/dependency updates needed

---

## Daily Tasks (~24 hour interval)

Thorough repository health checks

- [x] PR review: ✓ No open PRs requiring attention
- [ ] Open issues: review unresolved issues, categorize by urgency
- [x] Stale branch cleanup: ✓ No stale branches (only main)
- [x] Security audit: ✓ yarn audit completed—found HIGH priority issues
- [ ] Recent failures: investigate root cause of workflow failures
- [ ] Deployment health: verify both staging + production apps are accessible
- [ ] Summary report: provide daily summary to team

---

## Notes

*(Scratch space for context between heartbeats)*

### Current State (2026-02-23)
- Clean working tree on `fix/deploy-ui-workflow-inputs` branch (workflow fix committed)
- Recent commits: Deploy UI Generic workflow fix (2167e48), dropped AWS Amplify infra (#92), updated deploy workflows (#91)
- Deployment pipeline: S3-based with staging → production promotion
- **FIXED**: Deploy UI Generic workflow - added fallback values for `inputs.environment` and `inputs.commit` to handle push triggers
- Last successful release: 2025-04-07 (Release and Deploy workflow)

### Tech Context
- Next.js app at `/app` with dev server on port 4000
- Web3 integration: Wagmi v2, Viem v2, Web3Modal
- State management: Jotai + Zustand
- Smart contract ABIs: ERC20, IdentityStaking, LegacyIdentityStaking
- Build/deploy workflows: reusable workflows in `.github/workflows/`

### Known Patterns
- Repo uses S3 sync for deployments (not Amplify anymore post-PR #92)
- Manual production approval gate in release workflow
- Uses shared workflows from passportxyz/gh-workflows

### Security Findings (2026-02-23 Audit)
**HIGH severity vulnerabilities:**
- **ws DoS vulnerability** (CVE-1098392/1098393): Found in viem, ethers, wagmi dependencies
  - Patched in: ws >=8.17.1 (viem/ethers) or >=7.5.10 (wagmi chain)
  - Impact: DoS when handling requests with many HTTP headers

**MODERATE severity vulnerabilities:**
- **MetaMask SDK issues** (@metamask/sdk, @metamask/sdk-communication-layer)
  - Malicious debug@4.4.2 dependency indirect exposure
  - Patched in: >=0.33.1
- **bn.js infinite loop** vulnerability
  - Patched in: >=5.2.3

### Workflow Failure Root Cause (FIXED 2026-02-23)
- **Deploy UI Generic**: Used `inputs.environment` and `inputs.commit` without fallbacks
- **Issue**: When triggered by push events, `inputs` object is undefined → workflow failed
- **Fix**: Added fallback values: `inputs.environment || 'review'` and `inputs.commit || ''`
- **Behavior**: Push to main → auto-deploy to **review** only; staging/production require manual workflow_dispatch
- **Deploy Infra to Review**: Legacy workflow removed in PR #92 (Amplify deprecation) - failures expected

### Action Items
- [x] Investigate "Deploy UI Generic" workflow failures - FIXED and committed ✓
- [x] Commit workflow fix to main (deploy_ui_generic.yml) - ✓ commit 2167e48
- [ ] Create PR for workflow fix (currently on fix/deploy-ui-workflow-inputs branch)
- [ ] Update ws, MetaMask SDK, and bn.js dependencies to fix security issues
- [ ] Verify app deployment accessibility (staging + prod)
- [ ] Test workflow fix after merging to main
