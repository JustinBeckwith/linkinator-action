const core = require('@actions/core');
const { LinkChecker } = require('linkinator');

async function main () {
  try {
    // The options returned from `getInput` appear to always be strings.
    const options = {
      path: qq('paths', '*.md'),
      concurrency: Number(qq('concurrency', 100)),
      recurse: Boolean(qq('recurse', false)),
      linksToSkip: qq('skip', undefined),
      timeout: Number(qq('timeout', 0)),
      markdown: Boolean(qq('markdown', true)),
      serverRoot: qq('serverRoot', undefined),
    };
    console.log(options);

    const checker = new LinkChecker()
      .on('pagestart', url => {
        console.log(`Scanning ${url}`);
      });

    const result = await checker.check(options);
    if (!result.passed) {
      const brokenLinks = result.links.filter(x => x.state === 'BROKEN');
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

function qq (propName, defaultValue, typeFunction) {
  return core.getInput(propName) === ''
    ? defaultValue
    : core.getInput(propName);
}

if (require.main === module) {
  main();
} else {
  // export for tests
  module.exports = main;
}
