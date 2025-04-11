#!/bin/bash

# Matrix.css Next.js Framework Extraction Script
# This script extracts the consolidated framework file into a proper file structure

set -e # Exit on any error

# Color variables for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if required commands are available
check_requirements() {
  echo -e "${BLUE}[INFO]${NC} Checking system requirements..."
  
  MISSING_REQS=0
  
  # Check for Node.js
  if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Node.js is not installed. Please install Node.js to proceed."
    MISSING_REQS=1
  else
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    echo -e "${GREEN}[OK]${NC} Node.js version $NODE_VERSION is installed."
  fi
  
  # Check for npm
  if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} npm is not installed. Please install npm to proceed."
    MISSING_REQS=1
  else
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}[OK]${NC} npm version $NPM_VERSION is installed."
  fi

  # Exit if requirements are missing
  if [ $MISSING_REQS -eq 1 ]; then
    echo -e "${RED}[ERROR]${NC} Please install the missing requirements and try again."
    exit 1
  fi
}

# Extract project name from user or use default
get_project_name() {
  read -p "Enter project name (default: matrix-nextjs): " PROJECT_NAME
  PROJECT_NAME=${PROJECT_NAME:-matrix-nextjs}
  
  # Sanitize project name (replace spaces with hyphens, remove special characters)
  PROJECT_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
  
  # Check if directory already exists
  if [ -d "$PROJECT_NAME" ]; then
    echo -e "${YELLOW}[WARNING]${NC} Directory '$PROJECT_NAME' already exists."
    read -p "Do you want to overwrite it? (y/N): " OVERWRITE
    
    if [[ "$OVERWRITE" =~ ^[Yy]$ ]]; then
      echo -e "${YELLOW}[WARNING]${NC} Removing existing directory..."
      rm -rf "$PROJECT_NAME"
    else
      echo -e "${RED}[ERROR]${NC} Extraction canceled. Please choose a different project name."
      exit 1
    fi
  fi
  
  echo -e "${GREEN}[OK]${NC} Using project name: $PROJECT_NAME"
}

# Create the project structure
create_project_structure() {
  echo -e "${BLUE}[INFO]${NC} Creating project structure..."
  
  mkdir -p "$PROJECT_NAME"
  mkdir -p "$PROJECT_NAME/src/components/ui"
  mkdir -p "$PROJECT_NAME/src/components/layout"
  mkdir -p "$PROJECT_NAME/src/components/effects"
  mkdir -p "$PROJECT_NAME/src/context"
  mkdir -p "$PROJECT_NAME/src/hooks"
  mkdir -p "$PROJECT_NAME/src/utils"
  mkdir -p "$PROJECT_NAME/src/styles"
  mkdir -p "$PROJECT_NAME/src/pages"
  mkdir -p "$PROJECT_NAME/public"
  
  echo -e "${GREEN}[OK]${NC} Project structure created successfully."
}

# Extract files from the consolidated file
extract_files() {
  echo -e "${BLUE}[INFO]${NC} Extracting files from the consolidated framework..."
  
  # Use the path to the consolidated file as input
  CONSOLIDATED_FILE="$1"
  
  # Check if the consolidated file exists
  if [ ! -f "$CONSOLIDATED_FILE" ]; then
    echo -e "${RED}[ERROR]${NC} Consolidated file '$CONSOLIDATED_FILE' not found."
    exit 1
  fi
  
  # Create a temporary file for processing
  TEMP_FILE=$(mktemp)
  
  # Extract file sections and write them to the correct locations
  CURRENT_FILE=""
  EXTRACT_CONTENT=false
  TOTAL_FILES=0
  EXTRACTED_FILES=0
  
  # First pass: count total files
  while IFS= read -r line; do
    if [[ "$line" =~ ^===== ]]; then
      TOTAL_FILES=$((TOTAL_FILES + 1))
    fi
  done < "$CONSOLIDATED_FILE"
  
  # Second pass: extract files
  while IFS= read -r line; do
    # Check if this line starts a new file section
    if [[ "$line" =~ ^===== ]]; then
      # If we were extracting content, write the temp file to the destination
      if [ "$EXTRACT_CONTENT" = true ] && [ -n "$CURRENT_FILE" ]; then
        # Create directory if it doesn't exist
        mkdir -p "$(dirname "$PROJECT_NAME/$CURRENT_FILE")"
        
        # Write temp file to destination
        cp "$TEMP_FILE" "$PROJECT_NAME/$CURRENT_FILE"
        
        # Reset temp file
        > "$TEMP_FILE"
        
        EXTRACTED_FILES=$((EXTRACTED_FILES + 1))
        echo -e "${GREEN}[OK]${NC} Extracted: $CURRENT_FILE (${EXTRACTED_FILES}/${TOTAL_FILES})"
      fi
      
      # Extract file path from the line (remove the ===== markers)
      CURRENT_FILE=$(echo "$line" | sed 's/^===== //;s/ =====$//')
      EXTRACT_CONTENT=true
      
    # If we're extracting content and this is not a file marker, add it to the temp file
    elif [ "$EXTRACT_CONTENT" = true ]; then
      echo "$line" >> "$TEMP_FILE"
    fi
  done < "$CONSOLIDATED_FILE"
  
  # Handle the last file
  if [ "$EXTRACT_CONTENT" = true ] && [ -n "$CURRENT_FILE" ]; then
    mkdir -p "$(dirname "$PROJECT_NAME/$CURRENT_FILE")"
    cp "$TEMP_FILE" "$PROJECT_NAME/$CURRENT_FILE"
    EXTRACTED_FILES=$((EXTRACTED_FILES + 1))
    echo -e "${GREEN}[OK]${NC} Extracted: $CURRENT_FILE (${EXTRACTED_FILES}/${TOTAL_FILES})"
  fi
  
  # Clean up
  rm -f "$TEMP_FILE"
  
  echo -e "${GREEN}[SUCCESS]${NC} Extracted $EXTRACTED_FILES files successfully."
}

# Create a basic README.md file
create_readme() {
  echo -e "${BLUE}[INFO]${NC} Creating README.md file..."
  
  cat > "$PROJECT_NAME/README.md" << EOL
# Matrix.css Next.js Framework

A cyberpunk-inspired UI component library for Next.js applications with Matrix-style visual effects.

## Features

- Dark/light theme switching capabilities
- Matrix-inspired visual effects (code rain, terminal, glitch text)
- A complete set of UI components (buttons, cards, alerts, etc.)
- Full TypeScript support

## Getting Started

1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Run the development server:
   \`\`\`
   npm run dev
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Components

### UI Components
- Button
- Card
- Alert
- Badge
- Modal
- Progress
- Tabs
- Input
- Select
- Checkbox
- Radio
- Switch
- Dropdown
- Tooltip

### Layout Components
- Container
- Row
- Col
- Navbar
- Sidebar
- Footer

### Effect Components
- CodeRain
- Terminal
- GlitchText
- Scanline
- NeuralNetwork

## Theme Customization

Matrix.css provides a built-in theme context with dark and light modes. You can customize the theme by modifying the CSS variables in \`src/styles/globals.css\`.

EOL
  
  echo -e "${GREEN}[OK]${NC} README.md created successfully."
}

# Create a favicon.ico to prevent warnings
create_favicon() {
  echo -e "${BLUE}[INFO]${NC} Creating placeholder favicon.ico..."
  
  # Use a transparent 1x1 pixel as a minimal favicon to prevent browser warnings
  # This is a hex representation of a minimal ICO file
  echo -e "\x00\x00\x01\x00\x01\x00\x01\x01\x00\x00\x01\x00\x18\x00\x30\x00\x00\x00\x16\x00\x00\x00\x28\x00\x00\x00\x01\x00\x00\x00\x02\x00\x00\x00\x01\x00\x18\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00" | xxd -r -p > "$PROJECT_NAME/public/favicon.ico"
  
  echo -e "${GREEN}[OK]${NC} Favicon.ico created successfully."
}

# Verify project integrity
verify_project() {
  echo -e "${BLUE}[INFO]${NC} Verifying project integrity..."
  
  # Check for critical files
  MISSING_FILES=0
  
  CRITICAL_FILES=(
    "package.json"
    "tsconfig.json"
    "next.config.js"
    "src/pages/_app.tsx"
    "src/pages/index.tsx"
    "src/styles/globals.css"
    "src/context/ThemeContext.tsx"
  )
  
  for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$PROJECT_NAME/$file" ]; then
      echo -e "${RED}[ERROR]${NC} Critical file missing: $file"
      MISSING_FILES=1
    fi
  done
  
  if [ $MISSING_FILES -eq 1 ]; then
    echo -e "${RED}[ERROR]${NC} Project verification failed. Some critical files are missing."
    return 1
  else
    echo -e "${GREEN}[OK]${NC} All critical files are present."
    return 0
  fi
}

# Main function
main() {
  echo -e "${CYAN}===========================================================${NC}"
  echo -e "${CYAN}      MATRIX.CSS NEXT.JS FRAMEWORK EXTRACTION SCRIPT      ${NC}"
  echo -e "${CYAN}===========================================================${NC}"
  echo ""
  
  # Check system requirements
  check_requirements
  
  # Get path to consolidated file
  echo ""
  echo -e "${BLUE}[INFO]${NC} Please provide the path to the consolidated framework file."
  read -p "File path (default: ./matrix-nextjs-framework.md): " CONSOLIDATED_FILE
  CONSOLIDATED_FILE=${CONSOLIDATED_FILE:-./matrix-nextjs-framework.md}
  
  # Get project name
  echo ""
  get_project_name
  
  # Create project structure
  echo ""
  create_project_structure
  
  # Extract files from the consolidated file
  echo ""
  extract_files "$CONSOLIDATED_FILE"
  
  # Create additional files
  echo ""
  create_readme
  create_favicon
  
  # Verify project integrity
  echo ""
  if verify_project; then
    echo ""
    echo -e "${GREEN}===========================================================${NC}"
    echo -e "${GREEN}      MATRIX.CSS NEXT.JS FRAMEWORK EXTRACTED SUCCESSFULLY  ${NC}"
    echo -e "${GREEN}===========================================================${NC}"
    echo ""
    echo -e "Your project has been created in the ${CYAN}$PROJECT_NAME${NC} directory."
    echo -e "To get started:"
    echo -e "  1. cd ${CYAN}$PROJECT_NAME${NC}"
    echo -e "  2. Run ${YELLOW}npm install${NC}"
    echo -e "  3. Run ${YELLOW}npm run dev${NC}"
    echo -e "  4. Open ${BLUE}http://localhost:3000${NC} in your browser"
    echo ""
  else
    echo ""
    echo -e "${RED}===========================================================${NC}"
    echo -e "${RED}      MATRIX.CSS NEXT.JS FRAMEWORK EXTRACTION FAILED      ${NC}"
    echo -e "${RED}===========================================================${NC}"
    echo ""
    echo -e "Please check the error messages above and try again."
    exit 1
  fi
}

# Run the script
main