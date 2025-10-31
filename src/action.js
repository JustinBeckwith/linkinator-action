import fs from 'node:fs/promises';
import core from '@actions/core';
import { getConfig, LinkChecker, LinkState } from 'linkinator';

export async function getFullConfig() {
  const defaults = {
    path: ['*.md'],
    concurrency: 100,
    recurse: false,
    skip: [],
    timeout: 0,
    markdown: true,
    retry: false,
    retryErrors: false,
    retryErrorsCount: 3,
    retryErrorsJitter: 2000,
    verbosity: 'WARNING',
    allowInsecureCerts: false,
    requireHttps: false,
    cleanUrls: false,
    checkCss: false,
    checkFragments: false,
    redirects: 'allow',
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
    retryErrors: parseBoolean('retryErrors'),
    retryErrorsCount: parseNumber('retryErrorsCount'),
    retryErrorsJitter: parseNumber('retryErrorsJitter'),
    userAgent: parseString('userAgent'),
    verbosity: parseString('verbosity'),
    config: parseString('config'),
    allowInsecureCerts: parseBoolean('allowInsecureCerts'),
    requireHttps: parseBoolean('requireHttps'),
    cleanUrls: parseBoolean('cleanUrls'),
    checkCss: parseBoolean('checkCss'),
    checkFragments: parseBoolean('checkFragments'),
    statusCodes: parseJSON('statusCodes'),
    redirects: parseString('redirects'),
  };
  const urlRewriteSearch = parseString('urlRewriteSearch');
  const urlRewriteReplace = parseString('urlRewriteReplace');
  actionsConfig.urlRewriteExpressions = [];
  if (urlRewriteSearch && urlRewriteReplace) {
    actionsConfig.urlRewriteExpressions.push({
      pattern: urlRewriteSearch,
      replacement: urlRewriteReplace,
    });
  }
  const fileConfig = await getConfig(actionsConfig);
  const config = Object.assign({}, defaults, fileConfig);
  config.linksToSkip = config.skip;
  return config;
}

/**
 * Extract a user-friendly failure reason from a link result
 * @param {object} link The link result object
 * @returns {string} A human-readable failure reason
 */
function getFailureReason(link) {
  // If there are no failure details, return generic message
  if (!link.failureDetails || link.failureDetails.length === 0) {
    return link.status ? 'HTTP Error' : 'Request failed';
  }

  // Check for fragment/anchor validation errors
  for (const detail of link.failureDetails) {
    if (detail instanceof Error) {
      const message = detail.message || '';
      // Fragment validation errors typically contain 'fragment' or 'anchor'
      if (message.includes('fragment') || message.includes('anchor')) {
        return 'Fragment not found';
      }
      // Return the error message if it's informative
      if (message && message.length < 100) {
        return message;
      }
    }
  }

  // If we got a 200 but still failed, it's likely a fragment issue
  if (link.status === 200) {
    return 'Fragment not found';
  }

  // Default to HTTP error for other cases
  return link.status ? `HTTP ${link.status}` : 'Request failed';
}

export async function generateJobSummary(result, logger) {
  const brokenLinks = result.links.filter((x) => x.state === 'BROKEN');
  const okLinks = result.links.filter((x) => x.state === 'OK');
  const skippedLinks = result.links.filter((x) => x.state === 'SKIPPED');
  const totalLinks = result.links.length;

  // Start building the summary
  const summary = core.summary.addHeading('🔗 Linkinator Results', 2);

  // Add status line
  if (result.passed) {
    summary.addRaw(
      `\n**Status:** ✅ All links are valid!\n\n`,
    );
  } else {
    summary.addRaw(
      `\n**Status:** ❌ Found ${brokenLinks.length} broken ${brokenLinks.length === 1 ? 'link' : 'links'}\n\n`,
    );
  }

  // Add statistics
  summary.addHeading('📊 Summary', 3);
  summary.addList([
    `Total links scanned: ${totalLinks}`,
    `✅ Passed: ${okLinks.length}`,
    `❌ Broken: ${brokenLinks.length}`,
    `⏭️ Skipped: ${skippedLinks.length}`,
  ]);

  // Add broken links table if any exist
  if (brokenLinks.length > 0) {
    summary.addHeading('❌ Broken Links', 3);

    // Group broken links by parent
    const parents = brokenLinks.reduce((acc, curr) => {
      const parent = curr.parent || '(unknown)';
      if (!acc[parent]) {
        acc[parent] = [];
      }
      acc[parent].push(curr);
      return acc;
    }, {});

    // Create table rows grouped by parent
    const tableRows = [
      [
        { data: 'Status', header: true },
        { data: 'URL', header: true },
        { data: 'Reason', header: true },
        { data: 'Source', header: true },
      ],
    ];

    for (const parent of Object.keys(parents).sort()) {
      for (const link of parents[parent]) {
        const reason = getFailureReason(link);
        tableRows.push([
          String(link.status),
          link.url,
          reason,
          parent,
        ]);
      }
    }

    summary.addTable(tableRows);
  }

  // Write the summary
  await summary.write();
}

export async function main() {
  try {
    const config = await getFullConfig();
    const verbosity = getVerbosity(config.verbosity);
    const logger = new Logger(verbosity);
    const {
      GITHUB_HEAD_REF,
      GITHUB_BASE_REF,
      GITHUB_REPOSITORY,
      GITHUB_EVENT_PATH,
    } = process.env;
    // Read pull_request payload and use it to determine head user/repo:
    if (GITHUB_EVENT_PATH) {
      try {
        const payloadRaw = await fs.readFile(GITHUB_EVENT_PATH, 'utf8');
        const payload = JSON.parse(payloadRaw);
        if (payload?.pull_request?.head) {
          const repo = payload.pull_request.head.repo.full_name;
          core.info(`rewrite repo to ${repo}`);
          if (!config.urlRewriteExpressions) {
            config.urlRewriteExpressions = [];
          }
          // Escape special regex characters in branch names
          const escapeRegex = (str) =>
            str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const escapedBaseRef = escapeRegex(GITHUB_BASE_REF);

          // Match GitHub blob/tree URLs specifically to avoid greedy matching
          // that could include parts of the branch name in the path capture
          config.urlRewriteExpressions.push({
            pattern: new RegExp(
              `github\\.com/${GITHUB_REPOSITORY}/(blob|tree)/(${escapedBaseRef})/(.*)`,
            ),
            replacement: `github.com/${repo}/$1/${GITHUB_HEAD_REF}/$3`,
          });
        }
      } catch (err) {
        core.warning(err);
      }
    }

    const checker = new LinkChecker()
      .on('link', (link) => {
        switch (link.state) {
          case LinkState.BROKEN: {
            const reason = getFailureReason(link);
            logger.error(`[${link.status.toString()}] ${link.url} - ${reason}`);
            break;
          }
          case LinkState.OK:
            logger.warn(`[${link.status.toString()}] ${link.url}`);
            break;
          case LinkState.SKIPPED:
            logger.info(`[SKP] ${link.url}`);
            break;
        }
      })
      .on('retry', (retryInfo) => {
        logger.info('[RETRY]', retryInfo);
      });
    core.info(`Scanning ${config.path.join(', ')}`);
    const result = await checker.check(config);
    const nonSkippedLinks = result.links.filter((x) => x.state !== 'SKIPPED');
    core.info(`Scanned total of ${nonSkippedLinks.length} links!`);

    // Generate job summary
    await generateJobSummary(result, logger);

    if (!result.passed) {
      const brokenLinks = result.links.filter((x) => x.state === 'BROKEN');
      let failureOutput = `Detected ${brokenLinks.length} broken links.`;

      // build a map of failed links by the parent document
      const parents = brokenLinks.reduce((acc, curr) => {
        const parent = curr.parent || '';
        if (!acc[parent]) {
          acc[parent] = [];
        }
        acc[parent].push(curr);
        return acc;
      }, {});

      for (const parent of Object.keys(parents)) {
        failureOutput += `\n ${parent}`;
        for (const link of parents[parent]) {
          const reason = getFailureReason(link);
          failureOutput += `\n   [${link.status}] ${link.url} - ${reason}`;
          logger.debug(JSON.stringify(link.failureDetails, null, 2));
        }
      }
      core.setFailed(failureOutput);
    }
    core.setOutput('results', result);
  } catch (err) {
    core.setFailed(`Linkinator exception: \n${err.message}\n${err.stack}`);
  }
}

function parseString(input) {
  return core.getInput(input) || undefined;
}

function parseList(input) {
  const value = core.getInput(input) || undefined;
  if (value) {
    return value
      .split(/[\s,]+/)
      .map((x) => x.trim())
      .filter((x) => !!x);
  }
  return undefined;
}

function parseNumber(input) {
  const value = core.getInput(input) || undefined;
  if (value) {
    return Number(value);
  }
  return undefined;
}

function parseBoolean(input) {
  const value = core.getInput(input) || undefined;
  if (value) {
    return Boolean(value);
  }
  return undefined;
}

function parseJSON(input) {
  const value = core.getInput(input) || undefined;
  if (value) {
    try {
      return JSON.parse(value);
    } catch (err) {
      throw new Error(`Invalid JSON for ${input}: ${err.message}`);
    }
  }
  return undefined;
}

function getVerbosity(verbosity) {
  verbosity = verbosity.toUpperCase();
  const options = Object.keys(LogLevel);
  if (!options.includes(verbosity)) {
    throw new Error(
      `Invalid flag: VERBOSITY must be one of [${options.join(',')}]`,
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
  NONE: 4,
};

class Logger {
  constructor(level) {
    this.level = level;
  }

  debug(message) {
    if (this.level <= LogLevel.DEBUG) {
      core.info(message);
    }
  }

  info(message) {
    if (this.level <= LogLevel.INFO) {
      core.info(message);
    }
  }

  warn(message) {
    if (this.level <= LogLevel.WARNING) {
      core.info(message);
    }
  }

  error(message) {
    if (this.level <= LogLevel.ERROR) {
      core.error(message);
    }
  }
}
