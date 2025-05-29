import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

/**
 * Detects the package manager used in the current project
 * @param {string} projectPath - Path to the project directory
 * @returns {string} - The detected package manager ('npm', 'yarn', 'pnpm')
 */
export function detectPackageManager(projectPath = process.cwd()) {
  // Check for lock files
  if (fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))) {
    return 'pnpm'
  }

  if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) {
    return 'yarn'
  }

  if (fs.existsSync(path.join(projectPath, 'package-lock.json'))) {
    return 'npm'
  }

  // Default to npm if no lock file is found
  return 'npm'
}

/**
 * Installs a package using the detected package manager
 * @param {string} packageName - Name of the package to install
 * @param {string} projectPath - Path to the project directory
 * @param {object} options - Installation options
 */
export function installPackage(
  packageName,
  projectPath = process.cwd(),
  options = {},
) {
  const packageManager = detectPackageManager(projectPath)
  const { isDev = false } = options

  let command

  switch (packageManager) {
    case 'pnpm':
      command = `pnpm add ${packageName}${isDev ? ' --save-dev' : ''}`
      break
    case 'yarn':
      command = `yarn add ${packageName}${isDev ? ' --dev' : ''}`
      break
    case 'npm':
    default:
      command = `npm install ${packageName}${isDev ? ' --save-dev' : ''}`
      break
  }

  console.log(`📦 Installing ${packageName} using ${packageManager}...`)

  try {
    execSync(command, {
      cwd: projectPath,
      stdio: 'inherit',
    })
    return true
  } catch (error) {
    console.error(`❌ Failed to install ${packageName}:`, error.message)
    return false
  }
}

/**
 * Gets the package manager name and version
 * @param {string} projectPath - Path to the project directory
 * @returns {object} - Package manager info
 */
export function getPackageManagerInfo(projectPath = process.cwd()) {
  const packageManager = detectPackageManager(projectPath)

  try {
    const versionOutput = execSync(`${packageManager} --version`, {
      cwd: projectPath,
      encoding: 'utf8',
      stdio: 'pipe',
    })

    return {
      name: packageManager,
      version: versionOutput.trim(),
    }
  } catch (error) {
    return {
      name: packageManager,
      version: 'unknown',
    }
  }
}
