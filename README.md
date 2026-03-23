# AWS Quiz Pro

Practice app for **AWS Solutions Architect Associate (SAA-C03)** — 505 questions with explanations.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

## Production Build

```bash
npm run build
```

Output goes to `dist/` — ready for static hosting (S3, CloudFront, Netlify, etc.).

## Re-parse Questions

If you update the source file in `resources/`, regenerate the JSON:

```bash
npx tsx scripts/parseQuestions.ts
```
