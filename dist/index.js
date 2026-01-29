// src/action.js
import fs from "node:fs/promises";
import * as core from "@actions/core";
import { getConfig, LinkChecker, LinkState } from "linkinator";
async function getFullConfig() {
  const defaults = {
    path: ["*.md"],
    concurrency: 100,
    recurse: false,
    skip: [],
    timeout: 0,
    markdown: true,
    retry: false,
    retryErrors: false,
    retryErrorsCount: 3,
    retryErrorsJitter: 2e3,
    verbosity: "WARNING",
    allowInsecureCerts: false,
    requireHttps: false,
    cleanUrls: false,
    checkCss: false,
    checkFragments: false,
    redirects: "allow"
  };
  const actionsConfig = {
    path: parseList("paths"),
    concurrency: parseNumber("concurrency"),
    recurse: parseBoolean("recurse"),
    skip: parseList("linksToSkip") || parseList("skip"),
    timeout: parseNumber("timeout"),
    markdown: parseBoolean("markdown"),
    serverRoot: parseString("serverRoot"),
    directoryListing: parseBoolean("directoryListing"),
    retry: parseBoolean("retry"),
    retryErrors: parseBoolean("retryErrors"),
    retryErrorsCount: parseNumber("retryErrorsCount"),
    retryErrorsJitter: parseNumber("retryErrorsJitter"),
    userAgent: parseString("userAgent"),
    verbosity: parseString("verbosity"),
    config: parseString("config"),
    allowInsecureCerts: parseBoolean("allowInsecureCerts"),
    requireHttps: parseBoolean("requireHttps"),
    cleanUrls: parseBoolean("cleanUrls"),
    checkCss: parseBoolean("checkCss"),
    checkFragments: parseBoolean("checkFragments"),
    statusCodes: parseJSON("statusCodes"),
    redirects: parseString("redirects")
  };
  const urlRewriteSearch = parseString("urlRewriteSearch");
  const urlRewriteReplace = parseString("urlRewriteReplace");
  actionsConfig.urlRewriteExpressions = [];
  if (urlRewriteSearch && urlRewriteReplace) {
    actionsConfig.urlRewriteExpressions.push({
      pattern: urlRewriteSearch,
      replacement: urlRewriteReplace
    });
  }
  const fileConfig = await getConfig(actionsConfig);
  const config = Object.assign({}, defaults, fileConfig);
  config.linksToSkip = config.skip;
  return config;
}
function isFragmentFailure(link) {
  if (link.failureDetails && link.failureDetails.length > 0) {
    for (const detail of link.failureDetails) {
      if (detail instanceof Error) {
        const message = detail.message || "";
        if (message.includes("fragment") || message.includes("anchor")) {
          return true;
        }
      }
    }
  }
  if (link.status === 200 && link.state === "BROKEN") {
    return true;
  }
  return false;
}
function getDisplayStatus(link) {
  if (isFragmentFailure(link)) {
    return "x";
  }
  return String(link.status || "");
}
function getFailureReason(link) {
  if (!link.failureDetails || link.failureDetails.length === 0) {
    return link.status ? "HTTP Error" : "Request failed";
  }
  if (isFragmentFailure(link)) {
    return "Fragment not found";
  }
  for (const detail of link.failureDetails) {
    if (detail instanceof Error) {
      const message = detail.message || "";
      if (message && message.length < 100) {
        return message;
      }
    }
  }
  return link.status ? `HTTP ${link.status}` : "Request failed";
}
async function generateJobSummary(result, logger) {
  const brokenLinks = result.links.filter((x) => x.state === "BROKEN");
  const okLinks = result.links.filter((x) => x.state === "OK");
  const skippedLinks = result.links.filter((x) => x.state === "SKIPPED");
  const totalLinks = result.links.length;
  const summary2 = core.summary.addHeading("\u{1F517} Linkinator Results", 2);
  if (result.passed) {
    summary2.addRaw(
      `
**Status:** \u2705 All links are valid!

`
    );
  } else {
    summary2.addRaw(
      `
**Status:** \u274C Found ${brokenLinks.length} broken ${brokenLinks.length === 1 ? "link" : "links"}

`
    );
  }
  summary2.addHeading("\u{1F4CA} Summary", 3);
  summary2.addList([
    `Total links scanned: ${totalLinks}`,
    `\u2705 Passed: ${okLinks.length}`,
    `\u274C Broken: ${brokenLinks.length}`,
    `\u23ED\uFE0F Skipped: ${skippedLinks.length}`
  ]);
  if (brokenLinks.length > 0) {
    summary2.addHeading("\u274C Broken Links", 3);
    const parents = brokenLinks.reduce((acc, curr) => {
      const parent = curr.parent || "(unknown)";
      if (!acc[parent]) {
        acc[parent] = [];
      }
      acc[parent].push(curr);
      return acc;
    }, {});
    const tableRows = [
      [
        { data: "Status", header: true },
        { data: "URL", header: true },
        { data: "Reason", header: true },
        { data: "Source", header: true }
      ]
    ];
    for (const parent of Object.keys(parents).sort()) {
      for (const link of parents[parent]) {
        const reason = getFailureReason(link);
        const displayStatus = getDisplayStatus(link);
        tableRows.push([
          displayStatus,
          link.url,
          reason,
          parent
        ]);
      }
    }
    summary2.addTable(tableRows);
  }
  await summary2.write();
}
async function main() {
  try {
    const config = await getFullConfig();
    const verbosity = getVerbosity(config.verbosity);
    const logger = new Logger(verbosity);
    const {
      GITHUB_HEAD_REF,
      GITHUB_BASE_REF,
      GITHUB_REPOSITORY,
      GITHUB_EVENT_PATH
    } = process.env;
    if (GITHUB_EVENT_PATH) {
      try {
        const payloadRaw = await fs.readFile(GITHUB_EVENT_PATH, "utf8");
        const payload = JSON.parse(payloadRaw);
        if (payload?.pull_request?.head) {
          const repo = payload.pull_request.head.repo.full_name;
          core.info(`rewrite repo to ${repo}`);
          if (!config.urlRewriteExpressions) {
            config.urlRewriteExpressions = [];
          }
          const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const escapedBaseRef = escapeRegex(GITHUB_BASE_REF);
          config.urlRewriteExpressions.push({
            pattern: new RegExp(
              `github\\.com/${GITHUB_REPOSITORY}/(blob|tree)/(${escapedBaseRef})/(.*)`
            ),
            replacement: `github.com/${repo}/$1/${GITHUB_HEAD_REF}/$3`
          });
        }
      } catch (err) {
        core.warning(err);
      }
    }
    const checker = new LinkChecker().on("link", (link) => {
      switch (link.state) {
        case LinkState.BROKEN: {
          const reason = getFailureReason(link);
          const displayStatus = getDisplayStatus(link);
          logger.error(`[${displayStatus}] ${link.url} - ${reason}`);
          break;
        }
        case LinkState.OK:
          logger.warn(`[${link.status.toString()}] ${link.url}`);
          break;
        case LinkState.SKIPPED:
          logger.info(`[SKP] ${link.url}`);
          break;
      }
    }).on("retry", (retryInfo) => {
      logger.info("[RETRY]", retryInfo);
    });
    core.info(`Scanning ${config.path.join(", ")}`);
    const result = await checker.check(config);
    const nonSkippedLinks = result.links.filter((x) => x.state !== "SKIPPED");
    core.info(`Scanned total of ${nonSkippedLinks.length} links!`);
    await generateJobSummary(result, logger);
    if (!result.passed) {
      const brokenLinks = result.links.filter((x) => x.state === "BROKEN");
      let failureOutput = `Detected ${brokenLinks.length} broken links.`;
      const parents = brokenLinks.reduce((acc, curr) => {
        const parent = curr.parent || "";
        if (!acc[parent]) {
          acc[parent] = [];
        }
        acc[parent].push(curr);
        return acc;
      }, {});
      for (const parent of Object.keys(parents)) {
        failureOutput += `
 ${parent}`;
        for (const link of parents[parent]) {
          const reason = getFailureReason(link);
          const displayStatus = getDisplayStatus(link);
          failureOutput += `
   [${displayStatus}] ${link.url} - ${reason}`;
          logger.debug(JSON.stringify(link.failureDetails, null, 2));
        }
      }
      core.setFailed(failureOutput);
    }
    core.setOutput("results", result);
  } catch (err) {
    core.setFailed(`Linkinator exception: 
${err.message}
${err.stack}`);
  }
}
function parseString(input) {
  return core.getInput(input) || void 0;
}
function parseList(input) {
  const value = core.getInput(input) || void 0;
  if (value) {
    return value.split(/[\s,]+/).map((x) => x.trim()).filter((x) => !!x);
  }
  return void 0;
}
function parseNumber(input) {
  const value = core.getInput(input) || void 0;
  if (value) {
    return Number(value);
  }
  return void 0;
}
function parseBoolean(input) {
  const value = core.getInput(input) || void 0;
  if (value) {
    return Boolean(value);
  }
  return void 0;
}
function parseJSON(input) {
  const value = core.getInput(input) || void 0;
  if (value) {
    try {
      return JSON.parse(value);
    } catch (err) {
      throw new Error(`Invalid JSON for ${input}: ${err.message}`);
    }
  }
  return void 0;
}
function getVerbosity(verbosity) {
  verbosity = verbosity.toUpperCase();
  const options = Object.keys(LogLevel);
  if (!options.includes(verbosity)) {
    throw new Error(
      `Invalid flag: VERBOSITY must be one of [${options.join(",")}]`
    );
  }
  return LogLevel[verbosity];
}
var LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
  NONE: 4
};
var Logger = class {
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
};

// src/index.js
main();
//# sourceMappingURL=index.js.map
