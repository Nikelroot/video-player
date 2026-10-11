import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const run = (command, args, options = {}) => execFileSync(command, args, {
  stdio: 'inherit', ...options,
});
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const pkg = () => JSON.parse(readFileSync('package.json', 'utf8'));
const registry = 'https://registry.npmjs.org';

async function metadata(name) {
  const response = await fetch(`${registry}/${encodeURIComponent(name)}`, {
    signal: AbortSignal.timeout(30_000),
  });
  if (response.status === 404) return { versions: {} };
  if (!response.ok) throw new Error(`npm registry returned HTTP ${response.status}`);
  return response.json();
}

function nextPatch(local, versions) {
  if (!/^\d+\.\d+\.\d+$/.test(local)) throw new Error('Expected a stable x.y.z package version');
  const stable = [local, ...Object.keys(versions).filter(v => /^\d+\.\d+\.\d+$/.test(v))];
  stable.sort((a, b) => {
    const x = a.split('.').map(Number);
    const y = b.split('.').map(Number);
    return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
  });
  const [major, minor, patch] = stable.at(-1).split('.').map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

async function release() {
  const { CI, CI_COMMIT_SHA: source, CI_COMMIT_BRANCH: branch, CI_DEFAULT_BRANCH: main,
    CI_PROJECT_URL: project, NPM_TOKEN, GITLAB_PUSH_TOKEN } = process.env;
  if (!CI || !source || !project || branch !== main || !branch) {
    throw new Error('Release must run in GitLab CI on the default branch');
  }
  if (!NPM_TOKEN || !GITLAB_PUSH_TOKEN) throw new Error('Set NPM_TOKEN and GITLAB_PUSH_TOKEN');

  const temp = mkdtempSync(join(tmpdir(), 'nvideoplayer-release-'));
  try {
    const askpass = join(temp, 'askpass.sh');
    writeFileSync(askpass, '#!/bin/sh\ncase "$1" in\n  *Username*) printf "%s\\n" "oauth2" ;;\n  *) printf "%s\\n" "$GITLAB_PUSH_TOKEN" ;;\nesac\n', { mode: 0o700 });
    process.env.GIT_ASKPASS = askpass;
    process.env.GIT_TERMINAL_PROMPT = '0';
    const npmrc = join(temp, 'npmrc');
    writeFileSync(npmrc, '//registry.npmjs.org/:_authToken=${NPM_TOKEN}\n', { mode: 0o600 });
    process.env.NPM_CONFIG_USERCONFIG = npmrc;
    const remote = `${project}.git`;
    run('git', ['fetch', remote, `refs/heads/${branch}`]);
    const head = git('rev-parse', 'FETCH_HEAD');
    const marker = `Release-Source: ${source}`;
    const retry = git('log', '-1', '--format=%B', head).split('\n').includes(marker)
      && git('rev-parse', `${head}^`) === source;
    if (head !== source && !retry) {
      console.log('A newer commit is on the default branch; skipping this stale pipeline.');
      return;
    }
    run('git', ['checkout', '--detach', head]);
    const published = await metadata(pkg().name);
    if (!retry) {
      const version = nextPatch(pkg().version, published.versions);
      run('npm', ['version', version, '--no-git-tag-version']);
    }
    const { name, version } = pkg();
    const tag = `v${version}`;
    if (retry && published.versions[version]) {
      console.log(`${name}@${version} is already published.`);
      return;
    }

    // Validate the final version before persisting it in the repository.
    run('npm', ['run', 'typecheck']);
    run('npm', ['run', 'build']);
    run('npm', ['pack', '--dry-run']);
    if (!retry) {
      run('git', ['config', 'user.name', 'GitLab Release Bot']);
      run('git', ['config', 'user.email', 'release-bot@nikelroot.ru']);
      run('git', ['add', 'package.json', 'package-lock.json']);
      run('git', ['commit', '-m', `chore: release ${version} [skip ci]`, '-m', marker]);
      run('git', ['tag', tag]);
      // No force push: concurrent changes reject the entire branch/tag update.
      run('git', ['push', '--atomic', remote, `HEAD:refs/heads/${branch}`, `refs/tags/${tag}`]);
    }
    // Persisting first allows a failed publication to resume with the same version.
    run('npm', ['publish', '--access', 'public', '--registry', registry]);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

await release();
