# Scrollforge IDE

A modern cross-platform desktop IDE featuring real Python execution via Pyodide (WebAssembly), live preview, and collaboration tools.

![Scrollforge IDE](https://via.placeholder.com/800x400/00bfff/ffffff?text=Scrollforge+IDE)

## Features

- **Real Python Execution** (Pyodide WASM with package support)
- **JavaScript, HTML, CSS** with live preview
- **Markdown Live Preview** (Marked.js)
- **Syntax Highlighting** for multiple languages
- **Auto-Save** (configurable interval)
- **Persistent File System**
- **Dark/Light Mode** with system detection
- **File Explorer Sidebar**
- **Toolbar** with mode switching and Pip install

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/thisiskrisg/scrollforge-desktop.git
   cd scrollforge-desktop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run dev` - Run in development mode with hot reload
- `npm test` - Run tests

## Project Structure

```
scrollforge-desktop/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── styles/         # CSS/styling
│   ├── utils/          # Utility functions
│   └── App.js          # Main application component
├── public/             # Static files
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## Technologies Used

- **Frontend:** React, Monaco Editor (VS Code editor)
- **Python Execution:** Pyodide (Python in WebAssembly)
- **Markdown:** Marked.js
- **Theming:** Dark/Light mode support
- **State Management:** React Hooks

## Features in Detail

### Python Execution
Write and run Python code directly in the browser using Pyodide. Install packages with pip.

### Live Preview
See HTML/CSS/JavaScript changes instantly with live preview pane.

### Markdown Support
Write markdown and see rendered output in real-time.

### File System
Create, edit, and organize files in a persistent file system.

### Dark Mode
Built-in dark mode with automatic system preference detection.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ by [ThisiskrisG](https://github.com/thisiskrisg)**
