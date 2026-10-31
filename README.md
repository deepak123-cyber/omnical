# OmniCalc Scientific Calculator

A full-stack, high-precision scientific calculator and graphing studio web application built with React, TypeScript, Tailwind CSS, Node.js, and Express.

Evaluates mathematical expressions safely using a custom tokenizer and recursive-descent AST parser without `eval()` or `new Function()`. Includes complete trigonometric functions with DEG/RAD modes, implicit multiplication, physical constants, memory registers, calculation history, 2D interactive graphing with Chart.js, and optional AI-assisted step-by-step explanations via the Gemini API.

---

## Features

- **Safe AST Math Parser**: Custom tokenizer and recursive-descent parser supporting arithmetic (`+`, `-`, `*`, `/`, `%`), right-associative exponentiation (`^`), and factorials (`!`).
- **Implicit Multiplication**: Supports natural math notation such as `2π`, `3(4+5)`, `2sin(30)`, and `5! 2`.
- **Scientific Functions & Constants**:
  - `sin`, `cos`, `tan`, `asin`, `acos`, `atan` (in DEG or RAD)
  - `sinh`, `cosh`, `tanh`
  - `log`, `ln`, `log2`, `logBase(x, b)`
  - `sqrt`, `cbrt`, `nthRoot(x, n)`
  - `abs`, `exp`, `floor`, `ceil`, `round`, `min`, `max`
  - Combinatorics: `nCr(n, r)` and `nPr(n, r)`
  - Physical constants: Speed of light ($c$), Gravity ($g$), Planck constant ($h$), Avogadro constant ($N_A$), Golden ratio ($\phi$), $\pi$, and $e$.
- **2D Function Graphing Studio**:
  - Interactive plotting powered by Chart.js.
  - Plots single-variable functions $f(x)$ within custom ranges $[x_{\min}, x_{\max}]$.
  - Gracefully handles vertical asymptotes (e.g. $\tan(x)$, $1/x$) and domain boundaries (e.g. $\sqrt{x}$) by generating discontinuous breaks.
  - Warns if multiple variables are detected.
  - Zoom and pan presets.
- **Memory Registers**: Full support for `MC`, `MR`, `M+`, `M−`, and `MS` with an active memory indicator ($M$).
- **Calculation History**: Stores the last 50 calculations in `localStorage`. Load any past expression with a single click.
- **Theming & Accessibility**: Light, dark, and system theme switching with zero-flicker Tailwind CSS v4 custom variant styling. Full keyboard navigation and accessible ARIA attributes.
- **AI Step-by-Step Breakdown (Optional)**: Uses `@google/genai` (Gemini 3.8 Flash) via a secure server-side endpoint (`POST /api/explain`) to explain order-of-operations and steps.

---

## Getting Started

### Prerequisites

- Node.js 20+ installed
- npm 10+

### Installation & Development

1. Clone or open the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server (runs Express server with Vite middleware on port 3000):
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running Unit Tests

Unit tests are written with Vitest, covering precedence, right-associative powers, implicit multiplication, trig in DEG/RAD modes, combinatorics, factorials, domain errors, and graphing point generation:

```bash
npm test
```

---

## Configuring the Gemini API Key (Optional)

To enable the "Explain with AI" step-by-step breakdown feature:

1. Obtain an API key from Google AI Studio.
2. Add the key to your `.env` file (or configure it in the **Settings > Secrets** panel in AI Studio):
   ```bash
   GEMINI_API_KEY="your_api_key_here"
   ```
3. When the key is detected, the "Explain with AI" button will automatically appear below evaluated calculations. If omitted, the button remains hidden and the calculator functions normally without error.

---

## Production Build & Deployment

### Option 1: AI Studio One-Click Deploy

Click the **Deploy** button in Google AI Studio to deploy directly to Cloud Run. The app binds to `0.0.0.0` at the port specified in `process.env.PORT` (defaults to 3000 or 8080).

### Option 2: Build & Run Locally / On Virtual Machine

```bash
# Build the production frontend bundle
npm run build

# Start the Node.js production server
npm start
```

### Option 3: Deploy to Google Cloud Run with Docker

Build and run using the included multi-stage `Dockerfile`:

```bash
# Build the Docker image
docker build -t omnicalc .

# Run the container locally on port 8080
docker run -p 8080:8080 -e PORT=8080 omnicalc
```

Deploy to Google Cloud Run:
```bash
gcloud run deploy omnicalc \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `0` - `9`, `.` | Digits and decimal point |
| `+`, `-`, `*`, `/` | Basic arithmetic operators |
| `^` | Power / Exponentiation ($x^y$) |
| `%` | Modulo |
| `!` | Factorial ($n!$) |
| `(` and `)` | Parentheses |
| `Enter` or `=` | Calculate result |
| `Backspace` | Delete last token / character |
| `Escape` | All Clear (AC) |
| `?` | Toggle keyboard shortcuts dialog |
