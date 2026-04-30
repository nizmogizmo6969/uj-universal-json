# Security Policy

## Supported Versions

UJ is pre-1.0. Security fixes are provided for the latest published `0.x` release.

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |

## Reporting Vulnerabilities

Please report suspected vulnerabilities privately by opening a GitHub security advisory for the repository, or by contacting the package maintainer listed on npm once published.

Include:

- The affected version.
- A minimal reproduction.
- The expected and actual behavior.
- Any known impact.

## Security Boundaries

UJ is not a sanitizer, validator, auth layer, permission layer, or security boundary.

UJ does not validate user input, remove unsafe content, authorize access, enforce schemas, encrypt data, audit data, or verify data authenticity. Applications must validate, sanitize, authorize, and protect data separately before trusting or acting on it.
