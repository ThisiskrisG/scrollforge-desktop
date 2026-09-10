# Scrollforge IDE

A modern cross-platform desktop IDE featuring real Python execution via Pyodide (WebAssembly), live preview, and collaboration tools.

![Scrollforge IDE](./docs/screenshot.png)

## 📋 Table of Contents
- [Features](#features)
- [Quick Start](#quick-start)
- [Visual Guide](#visual-guide)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Features in Detail](#features-in-detail)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## ✨ Features

- **Real Python Execution** (Pyodide WASM with package support)
- **JavaScript, HTML, CSS** with live preview
- **Markdown Live Preview** (Marked.js)
- **Syntax Highlighting** for multiple languages
- **Auto-Save** (configurable interval)
- **Persistent File System**
- **Dark/Light Mode** with system detection
- **File Explorer Sidebar**
- **Toolbar** with mode switching and Pip install

## 🚀 Quick Start

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

## 📸 Visual Guide

### IDE Layout Overview

The Scrollforge IDE features a clean, intuitive interface split into key sections:

```
┌─────────────────────────────────────────────────────────┐
│  TOOLBAR: Dark/Light Mode | Mode Selector | Pip Install │
├──────────────────┬──────────────────────────────────────┤
│                  │                                      │
│  FILE EXPLORER   │      MONACO EDITOR                  │
│  - Create File   │  (VS Code-powered)                  │
│  - Folder Tree   │  • Python Code                      │
│  - File Actions  │  • JavaScript                       │
│                  │  • HTML/CSS                         │
│                  │  • Markdown                         │
│                  │  • Multi-language Syntax Highlight  │
│                  │                                      │
├──────────────────┴──────────────────────────────────────┤
│                                                         │
│  LIVE PREVIEW PANE                                     │
│  • Real-time HTML/CSS/JS output                        │
│  • Python execution results                            │
│  • Markdown rendered preview                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Mode Selector

Scrollforge supports multiple programming modes:

| Mode | Description | Features |
|------|-------------|----------|
| **Python** | 🐍 Execute Python code in browser | Pyodide WASM, pip packages, full Python stdlib support |
| **Web** | 🌐 HTML/CSS/JavaScript | Live preview, syntax highlighting, real-time updates |
| **Markdown** | 📝 Document rendering | Marked.js, live preview, formatted output |

### File Explorer

```
📁 Your Project
├── 📄 script.py
├── 📄 index.html
├── 📄 style.css
├── 📄 README.md
└── 📁 utils/
    ├── 📄 helpers.py
    └── 📄 constants.js
```

**Actions Available:**
- ➕ Create new file
- 📁 Create new folder
- ✏️ Rename file/folder
- 🗑️ Delete file/folder
- 💾 Auto-save enabled

### Theme Support

**Dark Mode** (Default - System Detection)
```
Background: #1e1e1e (VS Code dark)
Text: #e0e0e0
Accent: #007acc (Blue)
```

**Light Mode**
```
Background: #ffffff
Text: #333333
Accent: #0078d4 (Blue)
```

## 📜 Available Scripts

```bash
npm start          # Start development server (port 3000)
npm run build      # Build for production
npm run dev        # Development mode with hot reload
npm test           # Run test suite
```

## 📁 Project Structure

```
scrollforge-desktop/
├── src/
│   ├── components/
│   │   ├── Editor.js          # Monaco Editor wrapper
│   │   ├── FileExplorer.js    # File tree navigation
│   │   ├── Preview.js         # Live preview pane
│   │   ├── Toolbar.js         # Top toolbar
│   │   └── ThemeToggle.js     # Dark/light mode
│   ├── pages/
│   │   └── IDE.js             # Main IDE page
│   ├── styles/
│   │   ├── App.css            # Global styles
│   │   ├── Editor.css         # Editor styles
│   │   └── dark-mode.css      # Dark theme
│   ├── utils/
│   │   ├── fileSystem.js      # File operations
│   │   ├── pythonRunner.js    # Pyodide integration
│   │   └── codeExecutor.js    # Code execution logic
│   ├── App.js                 # Main app component
│   └── index.js               # React entry point
├── public/
│   ├── index.html
│   └── favicon.ico
├── docs/
│   ├── screenshot.png         # Main IDE screenshot
│   ├── python-demo.png        # Python execution demo
│   ├── web-demo.png           # Web mode demo
│   └── features.md            # Feature documentation
├── package.json
├── .gitignore
├── LICENSE
└── README.md
```

## 🛠️ Technologies Used

| Technology | Purpose |
|-----------|---------|
| **React** | UI framework & component management |
| **Monaco Editor** | VS Code-powered code editor |
| **Pyodide** | Python execution in WebAssembly |
| **Marked.js** | Markdown parsing & rendering |
| **React Hooks** | State management |
| **CSS3** | Styling & theming |

## 💡 Features in Detail

### 🐍 Python Execution

Write and run Python code directly in the browser using Pyodide:

```python
# Example: Calculate Fibonacci
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

result = fibonacci(10)
print(f"10th Fibonacci number: {result}")
```

**Capabilities:**
- Full Python 3.11 support
- Install packages with pip (e.g., `numpy`, `pandas`, `requests`)
- File I/O and persistent storage
- Interactive REPL-like execution

### 🌐 Live Preview

See HTML/CSS/JavaScript changes instantly with live preview pane:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        h1 { color: white; text-align: center; padding: 50px; }
    </style>
</head>
<body>
    <h1>Welcome to Scrollforge!</h1>
</body>
</html>
```

**Features:**
- Real-time rendering
- Console output display
- Error messages in preview
- Responsive design preview

### 📝 Markdown Support

Write markdown and see rendered output in real-time:

```markdown
# My Project Documentation

## Features
- Code execution
- Live preview
- File management

### Code Block
```python
print("Hello, Scrollforge!")
```
```

**Rendering:**
- Headings (H1-H6)
- Tables, lists, code blocks
- Links and images
- Bold, italic, strikethrough
- Custom styling support

### 💾 File System

Create, edit, and organize files in a persistent file system:

```
✅ Create unlimited files
✅ Organize into folders
✅ Automatic backup/save
✅ File versioning ready
✅ Persistent storage (IndexedDB)
```

### 🌓 Dark Mode

Built-in dark mode with automatic system preference detection:

```javascript
// Automatic detection
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // Apply dark theme
}

// Manual toggle in toolbar
// Dark mode ☀️ ↔️ 🌙 Light mode
```

## 🎯 Use Cases

- **Learning:** Practice Python, JavaScript, HTML/CSS without installation
- **Prototyping:** Quick code experiments and MVP building
- **Teaching:** Interactive coding demonstrations
- **Documentation:** Live code examples in markdown
- **Web Development:** Full-stack development environment

## 📊 Example Workflow

1. **Open Scrollforge** → Navigate to `http://localhost:3000`
2. **Create a Python file** → `analysis.py` via File Explorer
3. **Write Python code** → Use full syntax highlighting
4. **Run Python** → Execute via toolbar Pip/Run button
5. **See results** → View output in live preview pane
6. **Auto-save** → Changes saved automatically every 30 seconds

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow
```bash
git checkout -b feature/your-feature
npm run dev
# Make your changes
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

For issues, questions, or suggestions:
- 📝 [Open an issue](https://github.com/ThisiskrisG/scrollforge-desktop/issues)
- 💬 [Start a discussion](https://github.com/ThisiskrisG/scrollforge-desktop/discussions)
- 📧 Reach out to the maintainer

---

**Made with ❤️ by [ThisiskrisG](https://github.com/thisiskrisg)**

*Last Updated: September 2026*
*Version: 1.0.0*
