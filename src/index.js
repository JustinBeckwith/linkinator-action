const core = require('@actions/core');
const { LinkChecker } = require('linkinator');

async function main () {
  try {
    const options = {
      path: core.getInput('paths'),
      concurrency: core.getInput('concurrency'),
      recurse: core.getInput('recurse'),
      linksToSkip: core.getInput('skip'),
      timeout: core.getInput('timeout'),
      markdown: typeof core.getInput('markdown') === 'undefined' ? true : core.getInput('markdown'),
      serverRoot: core.getInput('serverRoot')
    };

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
      throw new Error(failureOutput);
    }
    console.log(`Scanned total of ${result.links.length} links!`);
    core.setOutput('results', result);
  } catch (err) {
    core.setFailed(`linkinator failed: \n${err.message}`);
  }
}

if (require.main === module) {
  main();
} else {
  module.exports = main;
}
