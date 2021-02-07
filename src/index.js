const core = require('@actions/core');
const { LinkChecker, LinkState } = require('linkinator');

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
      directoryListing: Boolean(qq('directoryListing', false)),
      retry: Boolean(qq('retry', false))
    };

    const verbosity = getVerbosity();
    const logger = new Logger(verbosity);

    const checker = new LinkChecker()
      .on('pagestart', url => {
        logger.error(`Scanning ${url}`);
      })
      .on('link', link => {
        switch (link.state) {
          case LinkState.BROKEN:
            logger.error(`[${link.status.toString()}] ${link.url}`);
            break;
          case LinkState.OK:
            logger.info(`[${link.status.toString()}] ${link.url}`);
            break;
          case LinkState.SKIPPED:
            logger.debug(`[SKP] ${link.url}`);
            break;
        }
      });

    const result = await checker.check(options);
    const nonSkippedLinks = result.links.filter(x => x.state !== 'SKIPPED');
    logger.error(`Scanned total of ${nonSkippedLinks.length} links!`);
    if (!result.passed) {
      const brokenLinks = result.links.filter(x => x.state === 'BROKEN');
      let failureOutput = `Detected ${brokenLinks.length} broken links.`;
      for (const link of brokenLinks) {
        failureOutput += `\n [${link.status}] ${link.url}`;
        logger.debug(JSON.stringify(link.failureDetails, null, 2));
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

function getVerbosity () {
  const verbosity = qq('verbosity', 'WARNING').toUpperCase();
  const options = Object.keys(LogLevel);
  if (!options.includes(verbosity)) {
    throw new Error(
      `Invalid flag: VERBOSITY must be one of [${options.join(',')}]`
    );
  }
  return LogLevel[verbosity];
}

// This was lifted from linkinator. We use `core.` instead of `console.`
// which made re-use more work than it was worth.
// https://github.com/JustinBeckwith/linkinator/blob/main/src/logger.ts

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
  NONE: 4
};

class Logger {
  constructor (level) {
    this.level = level;
  }

  debug (message) {
    if (this.level <= LogLevel.DEBUG) {
      core.debug(message);
    }
  }

  info (message) {
    if (this.level <= LogLevel.INFO) {
      core.info(message);
    }
  }

  warn (message) {
    if (this.level <= LogLevel.WARNING) {
      core.log(message);
    }
  }

  error (message) {
    if (this.level <= LogLevel.ERROR) {
      core.error(message);
    }
  }
}

if (require.main === module) {
  main();
} else {
  // export for tests
  module.exports = main;
}
