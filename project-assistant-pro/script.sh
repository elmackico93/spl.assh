#!/bin/bash

# ======================================================
# Script Generator Pro - Complete Setup Script
# ======================================================
# This script performs all necessary modifications to integrate
# scriptgen.html with server.js and set up the application
# properly on Ubuntu.
#
# Features:
# - Installs all required dependencies
# - Sets up the correct directory structure
# - Applies fixes for the loading issues
# - Configures the server
# - Provides start commands and verification
# ======================================================

# Set terminal colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Function to display status messages
status_message() {
    echo -e "${BOLD}${BLUE}[STATUS]${NC} $1"
}

# Function to display success messages
success_message() {
    echo -e "${BOLD}${GREEN}[SUCCESS]${NC} $1"
}

# Function to display error messages
error_message() {
    echo -e "${BOLD}${RED}[ERROR]${NC} $1"
}

# Function to display warning messages
warning_message() {
    echo -e "${BOLD}${YELLOW}[WARNING]${NC} $1"
}

# Function to display section headers
section_header() {
    echo ""
    echo -e "${BOLD}${MAGENTA}======================================================${NC}"
    echo -e "${BOLD}${MAGENTA}    $1${NC}"
    echo -e "${BOLD}${MAGENTA}======================================================${NC}"
    echo ""
}

# Function to check command execution status
check_status() {
    if [ $? -eq 0 ]; then
        success_message "$1"
    else
        error_message "$2"
        exit 1
    fi
}

# Save current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

# ======================================================
# Initial Setup and Dependencies
# ======================================================
section_header "Initial Setup and Dependencies"

# Check if Node.js is installed
status_message "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    warning_message "Node.js is not installed. Installing Node.js and npm..."
    
    # Install Node.js and npm
    sudo apt update
    sudo apt install -y curl
    curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt install -y nodejs
    
    check_status "Node.js and npm installed successfully" "Failed to install Node.js and npm"
else
    NODE_VERSION=$(node -v)
    success_message "Node.js is already installed (${NODE_VERSION})"
fi

# Change to the project directory
if [ "$SCRIPT_DIR" != "$(pwd)" ]; then
    cd "$SCRIPT_DIR"
    check_status "Changed to script directory: $SCRIPT_DIR" "Failed to change to script directory"
fi

# Install project dependencies
status_message "Installing project dependencies..."
npm install
check_status "Dependencies installed successfully" "Failed to install dependencies"

# Install additional required packages
status_message "Installing additional required packages..."
npm install express ws helmet compression cookie-parser express-rate-limit morgan winston open cors --save
check_status "Additional packages installed successfully" "Failed to install additional packages"

# ======================================================
# Directory Structure Setup
# ======================================================
section_header "Directory Structure Setup"

# Ensure the script-generator directory exists in public
status_message "Ensuring script-generator directory exists..."
mkdir -p public/script-generator
check_status "Script generator directory created/verified" "Failed to create script generator directory"

# ======================================================
# Backing up Original Files
# ======================================================
section_header "Backing up Original Files"

# Create a backups directory if it doesn't exist
mkdir -p backups
check_status "Backups directory created/verified" "Failed to create backups directory"

# Backup scriptgen.html
if [ -f public/scriptgen.html ]; then
    status_message "Backing up original scriptgen.html..."
    cp public/scriptgen.html backups/scriptgen.html.bak.$(date +%Y%m%d%H%M%S)
    check_status "Backed up scriptgen.html" "Failed to backup scriptgen.html"
fi

# Backup server.js
if [ -f server.js ]; then
    status_message "Backing up original server.js..."
    cp server.js backups/server.js.bak.$(date +%Y%m%d%H%M%S)
    check_status "Backed up server.js" "Failed to backup server.js"
fi

# ======================================================
# Fixing the Loading Issue in scriptgen.html
# ======================================================
section_header "Fixing Loading Issues in scriptgen.html"

# Create a temporary file for the modifications
status_message "Applying fixes to scriptgen.html..."
cat > /tmp/fix_loading.js << 'EOF'
// Add this function to better handle API initialization
async function enhancedInit() {
  // Connect to WebSocket
  connectWebSocket();
  
  try {
    console.log('Initializing generator...');
    
    // Initialize generator if needed
    const initResponse = await apiCall('/init', 'POST');
    console.log('Generator initialized response:', initResponse);
    
    // Add a delay to ensure server processes have completed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Load the generator state
    console.log('Fetching generator state...');
    const stateResponse = await apiCall('/state');
    console.log('Generator state response:', stateResponse);
    
    if (!stateResponse.data) {
      console.error('Invalid state response:', stateResponse);
      showNotification('Received invalid state from server', 'error');
      return;
    }
    
    updateGeneratorState(stateResponse.data);
    
    // Force UI updates regardless of data
    updateScriptsList();
    updateCategoriesList(true); // Pass true to force clearing loading indicators
    updateKeywordsList(true); // Pass true to force clearing loading indicators
    updateStatusPanel();
    updateGeneratorJobsList();
    
    // Show initial notification
    showNotification('System initialized. Ready to generate scripts.', 'info');
    
    // Load keywords
    updateKeywordsTerminal();
    
    // Add fallback timer for UI responsiveness
    setTimeout(() => {
      if (document.getElementById('categories-loading') && 
          document.getElementById('categories-loading').style.display !== 'none') {
        console.log('Forcing UI update after timeout...');
        // Force minimal state to unblock UI
        state.categories = [
          { id: 'windows', name: 'Windows', count: 0, enabled: true },
          { id: 'linux', name: 'Linux', count: 0, enabled: true },
          { id: 'mac', name: 'Mac', count: 0, enabled: true },
          { id: 'network', name: 'Network', count: 0, enabled: true },
          { id: 'security', name: 'Security', count: 0, enabled: true }
        ];
        updateCategoriesList(true);
        
        // Also update keywords terminal
        const keywordsTerminal = document.getElementById('keywordsTerminal');
        if (keywordsTerminal) {
          keywordsTerminal.innerHTML = '<div class="terminal-line"><span class="terminal-prompt">!</span><span>Server connection timeout. Try refreshing.</span></div>';
        }
        
        showNotification('Server connection issue detected. Some features may be limited.', 'warning');
      }
    }, 8000); // 8 second timeout
  } catch (error) {
    console.error('Initialization error:', error);
    showNotification('Failed to initialize: ' + error.message, 'error');
    
    // Force clear loading states even on error
    if (document.getElementById('categories-loading')) {
      document.getElementById('categories-loading').style.display = 'none';
    }
    const keywordsTerminal = document.getElementById('keywordsTerminal');
    if (keywordsTerminal) {
      keywordsTerminal.innerHTML = '<div class="terminal-line"><span class="terminal-prompt">!</span><span>Connection error. Please refresh.</span></div>';
    }
  }
}

// Modified updateCategoriesList function
function updateCategoriesList(forceShowEmpty = false) {
  const categoriesList = document.getElementById('categoriesList');
  const loadingElement = document.getElementById('categories-loading');
  
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
  
  if (state.categories.length === 0 && forceShowEmpty) {
    categoriesList.innerHTML = '<div class="list-item"><span class="list-item-title">No categories available</span></div>';
    return;
  }
  
  // Original function continues here...
}

// Modified updateKeywordsList function
function updateKeywordsList(forceShowEmpty = false) {
  const keywordsList = document.getElementById('keywordsList');
  const noKeywords = document.getElementById('noKeywords');
  const keywordsLoading = document.getElementById('keywordsLoading');
  
  if (keywordsLoading) {
    keywordsLoading.style.display = 'none';
  }
  
  if (state.keywords.length === 0) {
    keywordsList.innerHTML = '';
    noKeywords.style.display = 'block';
    return;
  }
  
  // Original function continues here...
}

// Replace the original init function call with enhancedInit
document.addEventListener('DOMContentLoaded', () => {
  // Initialize digital rain effect
  initDigitalRain();
  
  // Initialize the application with enhanced initialization
  enhancedInit();
});

// Improved WebSocket connection handling
function handleWebSocketOpen() {
  console.log('WebSocket connected, sending initial state request...');
  state.isConnected = true;
  state.reconnectAttempts = 0;
  updateConnectionStatus('Connected', 'success');
  
  // Explicitly request the state after connection
  if (state.ws && state.ws.readyState === WebSocket.OPEN) {
    state.ws.send(JSON.stringify({ 
      type: 'request_state',
      data: {} 
    }));
  }
  
  // Send a ping to keep the connection alive
  startPingInterval();
}
EOF

# Apply the fixes to scriptgen.html
# Find the original init() function in the DOMContentLoaded event and replace it with our enhanced init
if [ -f public/scriptgen.html ]; then
    # First, add the enhanced initialization functions before the closing script tag
    sed -i '/document\.addEventListener.*DOMContentLoaded.*{/,/init()/c\document.addEventListener("DOMContentLoaded", () => {\n  // Initialize digital rain effect\n  initDigitalRain();\n  \n  // Initialize the application with enhanced initialization\n  enhancedInit();\n});' public/scriptgen.html
    
    # Insert our enhanced init function before the end of the script
    sed -i '/<\/script>/i \
    // Enhanced initialization function to handle loading issues\
    async function enhancedInit() {\
      // Connect to WebSocket\
      connectWebSocket();\
      \
      try {\
        console.log("Initializing generator...");\
        \
        // Initialize generator if needed\
        const initResponse = await apiCall("/init", "POST");\
        console.log("Generator initialized response:", initResponse);\
        \
        // Add a delay to ensure server processes have completed\
        await new Promise(resolve => setTimeout(resolve, 1000));\
        \
        // Load the generator state\
        console.log("Fetching generator state...");\
        const stateResponse = await apiCall("/state");\
        console.log("Generator state response:", stateResponse);\
        \
        if (!stateResponse.data) {\
          console.error("Invalid state response:", stateResponse);\
          showNotification("Received invalid state from server", "error");\
          return;\
        }\
        \
        updateGeneratorState(stateResponse.data);\
        \
        // Force UI updates regardless of data\
        updateScriptsList();\
        updateCategoriesList(true);\
        updateKeywordsList(true);\
        updateStatusPanel();\
        updateGeneratorJobsList();\
        \
        // Show initial notification\
        showNotification("System initialized. Ready to generate scripts.", "info");\
        \
        // Load keywords\
        updateKeywordsTerminal();\
        \
        // Add fallback timer for UI responsiveness\
        setTimeout(() => {\
          if (document.getElementById("categories-loading") && \
              document.getElementById("categories-loading").style.display !== "none") {\
            console.log("Forcing UI update after timeout...");\
            // Force minimal state to unblock UI\
            state.categories = [\
              { id: "windows", name: "Windows", count: 0, enabled: true },\
              { id: "linux", name: "Linux", count: 0, enabled: true },\
              { id: "mac", name: "Mac", count: 0, enabled: true },\
              { id: "network", name: "Network", count: 0, enabled: true },\
              { id: "security", name: "Security", count: 0, enabled: true }\
            ];\
            updateCategoriesList(true);\
            \
            // Also update keywords terminal\
            const keywordsTerminal = document.getElementById("keywordsTerminal");\
            if (keywordsTerminal) {\
              keywordsTerminal.innerHTML = "<div class=\"terminal-line\"><span class=\"terminal-prompt\">!</span><span>Server connection timeout. Try refreshing.</span></div>";\
            }\
            \
            showNotification("Server connection issue detected. Some features may be limited.", "warning");\
          }\
        }, 8000); // 8 second timeout\
      } catch (error) {\
        console.error("Initialization error:", error);\
        showNotification("Failed to initialize: " + error.message, "error");\
        \
        // Force clear loading states even on error\
        if (document.getElementById("categories-loading")) {\
          document.getElementById("categories-loading").style.display = "none";\
        }\
        const keywordsTerminal = document.getElementById("keywordsTerminal");\
        if (keywordsTerminal) {\
          keywordsTerminal.innerHTML = "<div class=\"terminal-line\"><span class=\"terminal-prompt\">!</span><span>Connection error. Please refresh.</span></div>";\
        }\
      }\
    }\
    \
    // Modified WebSocket open handler to ensure state is requested\
    function handleWebSocketOpen() {\
      console.log("WebSocket connected, sending initial state request...");\
      state.isConnected = true;\
      state.reconnectAttempts = 0;\
      updateConnectionStatus("Connected", "success");\
      \
      // Explicitly request the state after connection\
      if (state.ws && state.ws.readyState === WebSocket.OPEN) {\
        state.ws.send(JSON.stringify({ \
          type: "request_state",\
          data: {} \
        }));\
      }\
      \
      // Send a ping to keep the connection alive\
      startPingInterval();\
    }' public/scriptgen.html
    
    # Modify updateCategoriesList to handle the empty state
    sed -i 's/function updateCategoriesList() {/function updateCategoriesList(forceShowEmpty = false) {/' public/scriptgen.html
    
    # Add the empty state handling to updateCategoriesList
    sed -i '/if (loadingElement) {/a \
  \
  if (state.categories.length === 0 && forceShowEmpty) {\
    categoriesList.innerHTML = "<div class=\"list-item\"><span class=\"list-item-title\">No categories available</span></div>";\
    return;\
  }' public/scriptgen.html
    
    # Similarly modify updateKeywordsList
    sed -i 's/function updateKeywordsList() {/function updateKeywordsList(forceShowEmpty = false) {/' public/scriptgen.html
    
    check_status "Fixed scriptgen.html loading issues" "Failed to modify scriptgen.html"
else
    error_message "scriptgen.html not found in public directory"
    exit 1
fi

# ======================================================
# Enhancing server.js to properly handle WebSocket requests
# ======================================================
section_header "Enhancing server.js for WebSocket Support"

# Add this script to the server.js file to better handle the WebSocket 'request_state' message
status_message "Modifying server.js to handle request_state WebSocket message..."
if [ -f server.js ]; then
    # Backup the original file first
    cp server.js server.js.bak
    
    # Add code to handle the 'request_state' message in the WebSocket handler
    sed -i '/function handleWebSocketMessage(clientId, message) {/,/^  }/ {
        /switch (type) {/a \
    case "request_state":\
      if (client.app === "script-generator") {\
        if (!scriptGeneratorState.id) {\
          initScriptGenerator();\
        }\
        \
        sendToClient(clientId, WsMessageType.GENERATOR_STATUS, scriptGeneratorState);\
      } else if (client.app === "project-assistant") {\
        sendToClient(clientId, WsMessageType.SESSION_STATUS, {\
          ...projectAssistantSession,\
          modifiedFiles: Array.from(projectAssistantSession.modifiedFiles)\
        });\
      }\
      break;
    }
    }' server.js
    
    check_status "Enhanced server.js WebSocket handler" "Failed to modify server.js WebSocket handler"
else
    error_message "server.js not found"
    exit 1
fi

# ======================================================
# Create necessary files in the script-generator directory
# ======================================================
section_header "Setting up Script Generator files"

# Create an index.html file in public/script-generator that redirects to scriptgen.html
status_message "Creating index.html in script-generator directory..."
cat > public/script-generator/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Script Generator Pro</title>
  <meta http-equiv="refresh" content="0;url=/scriptgen.html">
  <style>
    body {
      font-family: 'Courier New', monospace;
      background-color: #0c0c0c;
      color: #00ff41;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .loader {
      border: 5px solid #072707;
      border-radius: 50%;
      border-top: 5px solid #00ff41;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin-right: 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loader"></div>
  <div>Redirecting to Script Generator Pro...</div>
</body>
</html>
EOF
check_status "Created index.html in script-generator directory" "Failed to create index.html"

# ======================================================
# Setting up Environment Variables
# ======================================================
section_header "Setting up Environment Variables"

# Create a .env file for environment variables if it doesn't exist
if [ ! -f .env ]; then
    status_message "Creating .env file for environment variables..."
    cat > .env << 'EOF'
# Script Generator Pro Environment Variables
PORT=4000
NODE_ENV=development

# OpenAI API key (you need to add your own key here)
OPENAI_API_KEY=

# Log settings
LOG_LEVEL=info
EOF
    check_status "Created .env file" "Failed to create .env file"
    
    warning_message "Please add your OpenAI API key to the .env file (OPENAI_API_KEY=your-api-key)"
else
    status_message "Checking .env file..."
    if ! grep -q "OPENAI_API_KEY" .env; then
        echo "# OpenAI API key (you need to add your own key here)" >> .env
        echo "OPENAI_API_KEY=" >> .env
        warning_message "Please add your OpenAI API key to the .env file (OPENAI_API_KEY=your-api-key)"
    else
        if grep -q "OPENAI_API_KEY=" .env; then
            warning_message "OPENAI_API_KEY is empty in .env file. Please add your API key."
        else
            success_message "OPENAI_API_KEY found in .env file."
        fi
    fi
fi

# ======================================================
# Setting up startup script
# ======================================================
section_header "Setting up Startup Script"

# Create a startup script that exports environment variables and starts the server
status_message "Creating startup script..."
cat > start.sh << 'EOF'
#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "\033[0;31mError: OPENAI_API_KEY is not set in .env file\033[0m"
    echo "Please add your OpenAI API key to the .env file and try again."
    exit 1
fi

# Start the server
echo -e "\033[0;32mStarting Script Generator Pro server...\033[0m"
node server.js
EOF

# Make the startup script executable
chmod +x start.sh
check_status "Created startup script" "Failed to create startup script"

# ======================================================
# Final Setup and Verification
# ======================================================
section_header "Final Setup and Verification"

# Make sure all files have the correct permissions
status_message "Setting file permissions..."
chmod -R 755 public
check_status "Set file permissions" "Failed to set file permissions"

# Create a link to scriptgen.html in the project root for easier access
if [ ! -L scriptgen.html ] && [ -f public/scriptgen.html ]; then
    ln -s public/scriptgen.html ./scriptgen.html
    check_status "Created link to scriptgen.html in project root" "Failed to create link to scriptgen.html"
fi

# Final message
section_header "Setup Complete!"

echo -e "${GREEN}Script Generator Pro has been set up successfully!${NC}"
echo ""
echo -e "${BOLD}To start the server:${NC}"
echo -e "  ${CYAN}1. Make sure you've added your OpenAI API key to the .env file${NC}"
echo -e "  ${CYAN}2. Run the start script: ${YELLOW}./start.sh${NC}"
echo ""
echo -e "${BOLD}Once the server is running:${NC}"
echo -e "  ${CYAN}- Access the Script Generator Pro at: ${YELLOW}http://localhost:4000/scriptgen.html${NC}"
echo ""
echo -e "${BOLD}If you encounter any issues:${NC}"
echo -e "  ${CYAN}- Check the server logs for error messages${NC}"
echo -e "  ${CYAN}- Make sure your OpenAI API key is valid${NC}"
echo -e "  ${CYAN}- Check browser console for client-side errors${NC}"
echo ""
echo -e "${MAGENTA}Happy scripting!${NC}"
echo ""

exit 0