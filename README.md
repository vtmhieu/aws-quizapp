# AWS Quiz Pro

A practice web application for **AWS Solutions Architect Associate (SAA-C03)** — featuring 684 questions, detailed explanations, and domain grouping.

🚀 **[Live Demo](https://vtmhieu.github.io/aws-quizapp/)**

## Features

- **684 Questions**: Sourced from actual SAA-C03 practice sets.
- **Domain Grouping**: Questions are heuristically categorized into the 4 official domains:
  - Design Secure Architectures
  - Design Resilient Architectures
  - Design High-Performing Architectures
  - Design Cost-Optimized Architectures
- **Multiple Choice UI**: Supports single-answer (A/B/C/D) and multiple-answer ("Choose two") questions.
- **Instant Feedback**: Auto-scoring with visual feedback and detailed explanations for the correct answers.
- **Review Missed**: A detailed breakdown of your selected options vs. the correct options at the end of every quiz.

---

## 🛠 Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Python 3.8+](https://www.python.org/) (Only needed if you want to re-parse the question data)

## 🚀 Getting Started

```bash
# Clone the repository and navigate to the directory
cd aws-quizapp

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open **http://localhost:5173** in your browser.

## 📦 Deployment (GitHub Pages)

This project is configured to be deployed on GitHub Pages.

```bash
# Builds the project and pushes to the gh-pages branch
npm run deploy
```

*Note: The `vite.config.ts` is configured with `base: '/aws-quizapp/'` to correctly serve assets from a subpath.*

## 🔧 Re-parsing Questions

If you update the source PDF or text files in the `resources/` directory and want to regenerate the JSON data, you can run the parsing script:

```bash
# Install Python dependencies (pdfplumber)
pip install pdfplumber

# Run the parsing script
python3 scripts/parse_with_choices.py
```

This will automatically read the PDF and Text files, perform heuristic domain grouping, and output the updated `src/data/questions.json` file.
