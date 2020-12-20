# linkinator-action
A GitHub Action that checks your README and other markdown for 404s.

## Inputs
- `paths` - Paths to scan for 404s. Defaults to `*.md`.
- `concurrency` - The number of connections to make simultaneously. Defaults to `100`.
- `recurse` - Recursively follow links on the same root domain.  Defaults to `false`.
- `linksToSkip` - List of urls in regexy form to not include in the check.
- `timeout` - Request timeout in ms.  Defaults to 0 (no timeout).
- `markdown` - Automatically parse and scan markdown if scanning from a location on disk. Defaults to `true`.
- `serverRoot` - When scanning a locally directory, customize the location on disk where the server is started.  Defaults to the root of your GitHub repository.

## Outputs
- `results` - An object with the results of the run.

## Example usage

uses: linkinator-action@v1
with:
  paths: '*.md'
  concurrency: 10

