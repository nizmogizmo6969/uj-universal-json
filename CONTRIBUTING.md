# Contributing

Thanks for helping improve UJ.

## Development

Install dependencies:

```sh
npm install
```

Run the verification commands:

```sh
npm run build
npm test
npm run smoke
npm run examples
npm pack --dry-run
```

## Dependency Policy

Keep runtime dependencies at zero unless there is a strong, documented reason to add one. UJ should stay a tiny TypeScript utility package.

Dev dependencies should be limited to tools needed to build, test, and package the project.
