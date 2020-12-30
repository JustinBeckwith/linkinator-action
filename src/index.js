const core = require('@actions/core');
const { LinkChecker, LinkState } = require('linkinator');

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
  NONE: 4
};

async function main () {
  try {
    // The options returned from `getInput` appear to always be strings.
    const options = {
      path: parseList(qq('paths', '*.md')),
      concurrency: Number(qq('concurrency', 100)),
      recurse: Boolean(qq('recurse', false)),
      linksToSkip: parseList(
        core.getInput('linksToSkip') ||
        core.getInput('skip' ||
        '')),
      timeout: Number(qq('timeout', 0)),
      markdown: Boolean(qq('markdown', true)),
      serverRoot: qq('serverRoot', undefined)
    };

    const verbosity = LogLevel[(core.getInput('verbosity') || 'WARNING').toUpperCase()];
    console.log(verbosity);

    const checker = new LinkChecker()
      .on('pagestart', url => {
        core.info(`Scanning ${url}`);
      })
      .on('link', link => {
        switch (link.state) {
          case LinkState.BROKEN:
            core.error(`[${link.status.toString()}] ${link.url}`);
            break;
          case LinkState.OK:
            core.info(`[${link.status.toString()}] ${link.url}`);
            break;
          case LinkState.SKIPPED:
            core.debug(`[SKP] ${link.url}`);
            break;
        }
      });

    const result = await checker.check(options);
    core.info(`Scanned total of ${result.links.length} links!`);
    if (!result.passed) {
      const brokenLinks = result.links.filter(x => x.state === 'BROKEN');
      let failureOutput = `Detected ${brokenLinks.length} broken links.`;
      for (const link of brokenLinks) {
        failureOutput += `\n [${link.status}] ${link.url}`;
      }
      core.setFailed(failureOutput);
    }
    core.setOutput('results', result);
  } catch (err) {
    core.setFailed(`Linkinator exception: \n${err.message}\n${err.stack}`);
  }
}

function qq (propName, defaultValue) {
  return core.getInput(propName) === ''
    ? defaultValue
    : core.getInput(propName);
}

function parseList (input) {
  return input.split(/[\s,]+/).map(x => x.trim()).filter(x => !!x);
}

if (require.main === module) {
  main();
} else {
  // export for tests
  module.exports = main;
}
