const core = require('@actions/core');
const { LinkChecker, LinkState } = require('linkinator');

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
  NONE: 4,
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
      serverRoot: qq('serverRoot', undefined),
    };

    const verbosity = LogLevel[(core.getInput('verbosity') || 'WARNING').toUpperCase()];

    const checker = new LinkChecker()
      .on('pagestart', url => {
        console.log(`Scanning ${url}`);
      });

    const result = await checker.check(options);
    const filteredResults = result.links.filter(link => {
      switch (link.state) {
        case LinkState.OK:
          return verbosity <= LogLevel.WARNING;
        case LinkState.BROKEN:
          if (verbosity > LogLevel.DEBUG) {
            link.failureDetails = undefined;
          }
          return verbosity <= LogLevel.ERROR;
        case LinkState.SKIPPED:
          return verbosity <= LogLevel.INFO;
      }
    });
    if (!result.passed) {
      const brokenLinks = result.links.filter(x => x.state === 'BROKEN');
      const skippedLinks = result.links.filter(x => x.state === 'SKIPPED');
      const okLinks = result.links.filter(x => x.state === 'OK');

      if (verbosity > LogLevel[''])
      let failureOutput = `Detected ${brokenLinks.length} broken links.`;
      for (const link of brokenLinks) {
        failureOutput += `\n [${link.status}] ${link.url}`;
      }
      core.setFailed(failureOutput);
      return;
    }
    console.log(`Scanned total of ${result.links.length} links!`);
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
