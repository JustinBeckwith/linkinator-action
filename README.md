# Linkinator Action

> Find broken links in Markdown, HTML, and websites—directly in GitHub Actions.

[Linkinator Action](https://github.com/JustinBeckwith/linkinator-action) is the GitHub Actions wrapper for [Linkinator](https://github.com/JustinBeckwith/linkinator). It checks local documentation and remote URLs, annotates failures in the workflow log, and writes a readable job summary.

![Linkinator Action](https://raw.githubusercontent.com/JustinBeckwith/linkinator-action/main/site/linkinator-action.webp)

## Quick start

Add `.github/workflows/links.yml` to your repository:

```yaml
name: Check links

on:
  pull_request:
  push:
    branches: [main]

jobs:
  linkinator:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: JustinBeckwith/linkinator-action@v2
```

That is it. By default, the action checks Markdown files matching `*.md` in the repository root and fails the job when it finds a broken link.

To scan every Markdown file in the repository:

```yaml
- uses: JustinBeckwith/linkinator-action@v2
  with:
    paths: '**/*.md'
```

## What you get

- Broken-link annotations in the workflow log
- A GitHub Actions job summary grouped by source file
- Support for local files, remote pages, redirects, fragments, and CSS URLs
- Configurable retries, timeouts, status-code policies, and skip patterns
- A machine-readable `results` output for later workflow steps

## Common recipes

### Check anchors and fragments

Fragment checking is opt-in because it requires downloading and parsing page content:

```yaml
- uses: JustinBeckwith/linkinator-action@v2
  with:
    paths: '**/*.md'
    checkFragments: true
```

### Skip unreliable or private URLs

`linksToSkip` accepts comma- or whitespace-separated regular expressions. Skip rules are matched against the complete URL, including fragments.

```yaml
- uses: JustinBeckwith/linkinator-action@v2
  with:
    paths: '**/*.md'
    linksToSkip: >-
      ^https://example\.com/private
      ^https://(?:www\.)?ghostbrowser\.com(?:/|$)
      .*#L[0-9]+(?:-L[0-9]+)?$
```

`skip` is supported as an alias for `linksToSkip`.

### Retry transient failures

```yaml
- uses: JustinBeckwith/linkinator-action@v2
  with:
    paths: '**/*.md'
    timeout: 15000
    retry: true
    retryErrors: true
    retryErrorsCount: 3
    retryErrorsJitter: 2000
```

`retry` handles HTTP 429 responses with a `retry-after` header. `retryErrors` handles network errors and 5xx responses.

### Customize status-code handling

Map an exact status or a status family to `ok`, `warn`, `skip`, or `error`:

```yaml
- uses: JustinBeckwith/linkinator-action@v2
  with:
    statusCodes: '{"403":"warn","429":"skip","5xx":"warn"}'
```

### Enforce HTTPS and flag redirects

```yaml
- uses: JustinBeckwith/linkinator-action@v2
  with:
    requireHttps: error
    redirects: warn
```

`requireHttps` accepts `off`, `warn`, or `error`. The boolean values `true` and `false` are aliases for `error` and `off`. `redirects` accepts `allow`, `warn`, or `error`.

### Check a website recursively

```yaml
- uses: JustinBeckwith/linkinator-action@v2
  with:
    paths: https://example.com
    recurse: true
    concurrency: 20
```

Recursive scans follow links on the same root domain. Use a reasonable concurrency value when scanning a site you do not control.

### Check CSS URLs

```yaml
- uses: JustinBeckwith/linkinator-action@v2
  with:
    paths: public
    checkCss: true
```

This extracts URLs from CSS files, `<style>` blocks, and inline styles.

### Support clean URLs and directory links

```yaml
- uses: JustinBeckwith/linkinator-action@v2
  with:
    paths: docs
    cleanUrls: true
    directoryListing: true
```

`cleanUrls` lets a link such as `/about` resolve to `about.html`. `directoryListing` lets local links to directories resolve through an automatically generated directory index and defaults to `true`.

### Rewrite URLs in pull requests

The action automatically rewrites matching GitHub `blob` and `tree` links from the base branch to the pull request branch. You can also define one custom rewrite:

```yaml
- uses: JustinBeckwith/linkinator-action@v2
  with:
    urlRewriteSearch: '^https://docs\.example\.com/'
    urlRewriteReplace: 'https://preview.example.com/'
```

Both rewrite inputs must be provided together.

## Configuration file

For a larger configuration, add `linkinator.config.json` to the repository:

```json
{
  "recurse": false,
  "concurrency": 20,
  "skip": [
    "^https://example\\.com/private",
    "^mailto:"
  ],
  "statusCodes": {
    "403": "warn",
    "429": "skip",
    "5xx": "warn"
  }
}
```

Then reference it from the workflow:

```yaml
- uses: JustinBeckwith/linkinator-action@v2
  with:
    paths: '**/*.md'
    config: linkinator.config.json
```

Values supplied directly to the action take precedence over the configuration file. See the [Linkinator API options](https://github.com/JustinBeckwith/linkinator#api-usage) for the underlying configuration format.

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `paths` | `*.md` | Comma- or whitespace-separated paths, globs, directories, or URLs to scan. |
| `config` | `linkinator.config.json` when present | Path to a Linkinator configuration file. |
| `concurrency` | `100` | Maximum number of concurrent requests. |
| `recurse` | `false` | Follow same-domain links recursively. |
| `linksToSkip` | — | Comma- or whitespace-separated URL regular expressions to skip. |
| `skip` | — | Alias for `linksToSkip`. |
| `timeout` | `0` | Request timeout in milliseconds; `0` disables the action-level timeout. |
| `markdown` | `true` | Parse Markdown when scanning local files. |
| `serverRoot` | repository root | Root from which local files are served. |
| `directoryListing` | `true` | Generate directory listings for local directory links. |
| `retry` | `false` | Retry 429 responses that include `retry-after`. |
| `retryErrors` | `false` | Retry network errors and 5xx responses. |
| `retryErrorsCount` | `3` | Maximum retries for network errors and 5xx responses. |
| `retryErrorsJitter` | `2000` | Maximum retry-delay jitter in milliseconds. |
| `userAgent` | Linkinator default | Custom HTTP User-Agent header. |
| `verbosity` | `WARNING` | One of `DEBUG`, `INFO`, `WARNING`, `ERROR`, or `NONE`. |
| `urlRewriteSearch` | — | Regular expression used for a custom URL rewrite. |
| `urlRewriteReplace` | — | Replacement used with `urlRewriteSearch`. |
| `allowInsecureCerts` | `false` | Allow invalid or self-signed TLS certificates. |
| `requireHttps` | `false` (`off`) | HTTPS policy: `off`, `warn`, or `error`. |
| `cleanUrls` | `false` | Resolve extensionless local links to `.html` files. |
| `checkCss` | `false` | Extract and check URLs found in CSS. |
| `checkFragments` | `false` | Validate fragment identifiers and anchors. |
| `statusCodes` | Linkinator defaults | JSON object mapping statuses or families to `ok`, `warn`, `skip`, or `error`. |
| `redirects` | `allow` | Redirect policy: `allow`, `warn`, or `error`. |

Boolean inputs should be written as `true` or `false`. See [`action.yml`](action.yml) for the canonical action metadata.

## Outputs

The action exposes the full Linkinator result as `results`:

```yaml
- id: links
  uses: JustinBeckwith/linkinator-action@v2

- name: Inspect results
  if: always()
  env:
    LINKINATOR_RESULTS: ${{ steps.links.outputs.results }}
  run: echo "$LINKINATOR_RESULTS"
```

The result includes the overall pass/fail state and each checked link's URL, status, state, parent, and failure details.

## Troubleshooting

### A valid URL reports a network failure

The action reports the underlying transport cause when available, such as `ENOTFOUND`, `ECONNREFUSED`, or a timeout. These failures can be specific to automated clients or GitHub-hosted runners.

1. Add a reasonable `timeout` and enable `retryErrors` for transient services.
2. Set `verbosity: DEBUG` to include complete error and cause details.
3. Add persistently bot-protected or unreliable domains to `linksToSkip`.

### Relative directory links return 404

Keep `directoryListing: true` when local documentation links to directories without an index file. If links are resolved from the wrong location, set `serverRoot` to the directory that represents the site's root.

### A skip pattern does not match

Skip values are regular expressions, not shell globs. Quote patterns in YAML, escape literal dots (`example\.com`), and remember that inputs are split on commas and whitespace. Use a configuration file when a pattern itself must contain either delimiter.

### I need more logging

Set `verbosity: DEBUG`. To include GitHub runner diagnostics as well, [enable debug logging in GitHub Actions](https://docs.github.com/actions/monitoring-and-troubleshooting-workflows/troubleshooting-workflows/enabling-debug-logging).

## Versioning and security

Use the moving major tag for automatic compatible updates:

```yaml
- uses: JustinBeckwith/linkinator-action@v2
```

For a fully immutable workflow, pin the action to a commit SHA and let a dependency updater manage it. The action runs on the Node.js runtime bundled by GitHub Actions; consumers do not need to install Node.js themselves.

## Contributing

Issues and pull requests are welcome. For changes to the underlying checker, visit the [Linkinator repository](https://github.com/JustinBeckwith/linkinator).

## License

[MIT](LICENSE)
