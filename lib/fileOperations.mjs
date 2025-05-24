import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Copies a template file to the target project
 * @param {string} templateName - Name of the template file
 * @param {string} targetPath - Target path in the project
 * @param {string} projectPath - Project root path
 */
export function copyTemplate(templateName, targetPath, projectPath = process.cwd()) {
  const templatePath = path.join(__dirname, '..', 'templates', templateName);
  const fullTargetPath = path.join(projectPath, targetPath);
  
  try {
    // Ensure target directory exists
    const targetDir = path.dirname(fullTargetPath);
    fs.mkdirSync(targetDir, { recursive: true });
    
    // Copy file
    fs.copyFileSync(templatePath, fullTargetPath);
    return true;
  } catch (error) {
    console.error(`❌ Failed to copy ${templateName}:`, error.message);
    return false;
  }
}

/**
 * Adds a script to the project's package.json
 * @param {string} scriptName - Name of the script
 * @param {string} scriptCommand - Command to run
 * @param {string} projectPath - Project root path
 */
export function addPackageScript(scriptName, scriptCommand, projectPath = process.cwd()) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  
  try {
    if (!fs.existsSync(packageJsonPath)) {
      console.error('❌ package.json not found in project directory');
      return false;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Initialize scripts object if it doesn't exist
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    // Add the script
    packageJson.scripts[scriptName] = scriptCommand;
    
    // Write back to file with proper formatting
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to add script to package.json:`, error.message);
    return false;
  }
}

/**
 * Creates the scripts directory and copies the npm-publish-tool script
 * @param {string} projectPath - Project root path
 */
export function createScriptsDirectory(projectPath = process.cwd()) {
  const scriptsDir = path.join(projectPath, 'scripts');
  
  try {
    // Create scripts directory if it doesn't exist
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }
    
    // Copy the npm-publish-tool script
    const success = copyTemplate('npm-publish-tool.mjs', 'scripts/npm-publish-tool.mjs', projectPath);
    
    if (success) {
      // Make the script executable
      const scriptPath = path.join(scriptsDir, 'npm-publish-tool.mjs');
      fs.chmodSync(scriptPath, '755');
    }
    
    return success;
  } catch (error) {
    console.error(`❌ Failed to create scripts directory:`, error.message);
    return false;
  }
}

/**
 * Checks if a file exists in the project
 * @param {string} filePath - Relative path to the file
 * @param {string} projectPath - Project root path
 * @returns {boolean} - Whether the file exists
 */
export function fileExists(filePath, projectPath = process.cwd()) {
  return fs.existsSync(path.join(projectPath, filePath));
}

/**
 * Ensures a directory exists
 * @param {string} dirPath - Directory path
 * @param {string} projectPath - Project root path
 */
export function ensureDirectory(dirPath, projectPath = process.cwd()) {
  const fullPath = path.join(projectPath, dirPath);
  try {
    fs.mkdirSync(fullPath, { recursive: true });
    return true;
  } catch (error) {
    console.error(`❌ Failed to create directory ${dirPath}:`, error.message);
    return false;
  }
} 