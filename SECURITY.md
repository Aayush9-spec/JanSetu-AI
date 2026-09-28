# Security policy

JanSetu AI is a prototype and does not provide authentication, a durable protected database, or production controls for sensitive citizen records. Do not submit real personal or confidential information to an untrusted deployment.

## Reporting a vulnerability

Please report suspected security issues privately to the repository owner rather than posting exploitable details publicly. Include the affected feature, impact, and reproducible steps. Do not include real citizen data, credentials, or API keys in the report.

## Deployment guidance

- Store `GEMINI_API_KEY` only in a trusted server environment. Never prefix a secret with `VITE_`, commit `.env`, or include keys in browser-visible configuration.
- Use only authorized data providers and avoid transmitting sensitive request details without the required privacy and access controls.
- Keep dependencies updated and review automated dependency alerts before deploying.
