const core = require('@actions/core');
const { LinkChecker, LinkState } = require('linkinator');
const { getConfig } = require('linkinator/build/src/config');

async function getFullConfig () {
  const defaults = {
    path: '*.md',
    concurrency: 100,
    recurse: false,
    skip: [],
    timeout: 0,
    markdown: true,
    retry: false,
    verbosity: 'WARNING'
  };
  // The options returned from `getInput` appear to always be strings.
  const actionsConfig = {
    path: parseList('paths'),
    concurrency: parseNumber('concurrency'),
    recurse: parseBoolean('recurse'),
    skip: parseList('linksToSkip') || parseList('skip'),
    timeout: parseNumber('timeout'),
    markdown: parseBoolean('markdown'),
    serverRoot: parseString('serverRoot'),
    directoryListing: parseBoolean('directoryListing'),
    retry: parseBoolean('retry'),
    verbosity: parseString('verbosity'),
    config: parseString('config')
  };
  const fileConfig = await getConfig(actionsConfig);
  const config = Object.assign({}, defaults, fileConfig);
  config.linksToSkip = config.skip;
  return config;
}

async function main () {
  try {
    const config = await getFullConfig();
    const verbosity = getVerbosity(config.verbosity);
    const logger = new Logger(verbosity);

    const checker = new LinkChecker()
      .on('link', link => {
        switch (link.state) {
          case LinkState.BROKEN:
            logger.error(`[${link.status.toString()}] ${link.url}`);
            break;
          case LinkState.OK:
            logger.warn(`[${link.status.toString()}] ${link.url}`);
            break;
          case LinkState.SKIPPED:
            logger.info(`[SKP] ${link.url}`);
            break;
        }
      });

    core.info(`Scanning ${config.path.join(', ')}`);
    const result = await checker.check(config);
    const nonSkippedLinks = result.links.filter(x => x.state !== 'SKIPPED');
    core.info(`Scanned total of ${nonSkippedLinks.length} links!`);
    if (!result.passed) {
      const brokenLinks = result.links.filter(x => x.state === 'BROKEN');
      let failureOutput = `Detected ${brokenLinks.length} broken links.`;
      for (const link of brokenLinks) {
        // Only show the rollup of failures if verbosity is hiding ok links.
        // If all you see is erros, getting a list of errors twice don't look right.
        if (verbosity < LogLevel.ERROR) {
          failureOutput += `\n [${link.status}] url: ${link.url}, parent: ${link.parent}`;
        }
        logger.debug(JSON.stringify(link.failureDetails, null, 2));
      }
      core.setFailed(failureOutput);
    }
    core.setOutput('results', result);
  } catch (err) {
    core.setFailed(`Linkinator exception: \n${err.message}\n${err.stack}`);
  }
}

function parseString (input) {
  return core.getInput(input) || undefined;
}

function parseList (input) {
  const value = core.getInput(input) || undefined;
  if (value) {
    return value.split(/[\s,]+/).map(x => x.trim()).filter(x => !!x);
  }
  return undefined;
}

function parseNumber (input) {
  const value = core.getInput(input) || undefined;
  if (value) {
    return Number(value);
  }
  return undefined;
}

function parseBoolean (input) {
  const value = core.getInput(input) || undefined;
  if (value) {
    return Boolean(value);
  }
  return undefined;
}

function getVerbosity (verbosity) {
  verbosity = verbosity.toUpperCase();
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
      core.info(message);
    }
  }

  info (message) {
    if (this.level <= LogLevel.INFO) {
      core.info(message);
    }
  }

  warn (message) {
    if (this.level <= LogLevel.WARNING) {
      core.info(message);
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
  module.exports.action = main;
  module.exports.getFullConfig = getFullConfig;
}
