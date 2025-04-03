# Project Assistant Pro

Advanced AI-powered tool for Next.js/React Development with Matrix-style UI Interface

![Project Assistant Pro Banner](https://placeholder-image.com/project-assistant-pro-banner.png)

## Overview

Project Assistant Pro is a powerful development assistant that leverages AI to help you build Next.js and React applications more efficiently. The tool analyzes your project structure, understands your codebase, and generates high-quality code based on your descriptions.

### Key Features

- **AI-Powered Code Generation**: Generate components, functions, and features with natural language descriptions
- **Project Analysis**: Automatically detect framework, router type, styling solutions, and more
- **Matrix-Style UI**: Modern, responsive interface with stunning visual effects
- **Dual Interface**: Use both command line and browser interfaces
- **Code Backups**: Automatic backups of modified files
- **Session Management**: Save and restore project sessions
- **Cross-Platform Support**: Works on Windows, macOS, and Linux

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v7 or higher)
- OpenAI API key

### Quick Install

```bash
# Clone the repository
git clone https://github.com/yourusername/project-assistant-pro.git
cd project-assistant-pro

# Install dependencies
npm install

# Run setup script
npm run setup
```

### Manual Setup

1. Clone or download this repository
2. Install dependencies: `npm install`
3. Create configuration directory: `mkdir -p ~/.project-assistant`
4. Set your OpenAI API key as an environment variable:
   ```bash
   export OPENAI_API_KEY=your_api_key_here
   ```
   For permanent use, add this to your shell profile (e.g., `.bashrc`, `.zshrc`)
5. Run the setup script: `node setup.js`

## Usage

### Starting the Application

```bash
# Start with both CLI and web interface
npm start

# CLI only mode
npm start -- --cli-only

# Server/Web interface only
npm start -- --server-only
```

### Web Interface

Once started, the web interface will be available at: http://localhost:3030 (default port)

### Using the CLI

The command-line interface supports the following commands:

- `start` - Start a new session
- `status` - Display current session status
- `task <description>` - Execute a new task with the given description
- `export` - Export modified files
- `rollback` - Rollback changes to a file
- `load <session-id>` - Load a previous session
- `browse` - Open web interface in browser
- `help` - Display help information
- `exit` - Exit the application

### Example Tasks

```
# Create a new component
task Create a responsive navigation bar component with dropdown menus

# Modify existing code
task Update the user profile page to include the new avatar upload feature

# Fix issues
task Fix the authentication error when users try to reset their password
```

## Configuration

The configuration file is located at `~/.project-assistant/config.json` and includes settings for:

- AI model selection
- Token limits
- Theme preferences
- Server port
- File size limits
- Ignore patterns
- and more

## Matrix UI Features

The Matrix-style UI includes:

- Digital rain animation
- Glowing text effects
- Dark/light theme toggle
- Real-time updates via WebSocket
- Terminal-style output display
- Matrix-inspired visual transitions
- Responsive layout for all device sizes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for the GPT models that power the code generation
- The Matrix franchise for visual inspiration
- Next.js and React communities for creating amazing frameworks

---

Enhance your development workflow with Project Assistant Pro. Let AI handle the repetitive coding tasks while you focus on what matters most - creating amazing experiences.