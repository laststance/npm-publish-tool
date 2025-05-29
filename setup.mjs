#!/usr/bin/env node

import { Command } from 'commander'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

// Import utility modules
import {
  detectPackageManager,
  installPackage,
  getPackageManagerInfo,
} from './lib/packageManager.mjs'
import {
  copyTemplate,
  addPackageScript,
  createScriptsDirectory,
  fileExists,
  ensureDirectory,
} from './lib/fileOperations.mjs'
import {
  logSuccess,
  logError,
  logWarning,
  logInfo,
  logStep,
  logHeader,
  logSeparator,
  logCompletion,
  logPackageManager,
  logFileOperation,
  createProgressBar,
} from './lib/display.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get package.json info
const packageJsonPath = path.join(__dirname, 'package.json')
const packageInfo = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

const program = new Command()

program
  .name('npm-publish-tool')
  .description(packageInfo.description)
  .version(packageInfo.version)

program
  .command('setup')
  .description('Setup release-it configuration in your project')
  .option('-p, --path <path>', 'Project path', process.cwd())
  .action(async (options) => {
    const projectPath = path.resolve(options.path)

    logHeader('NPM Publish Tool Setup')
    logInfo(`Setting up release-it configuration in: ${projectPath}`)

    // Validate project directory
    if (!fs.existsSync(projectPath)) {
      logError(`Project directory does not exist: ${projectPath}`)
      process.exit(1)
    }

    if (!fileExists('package.json', projectPath)) {
      logError('No package.json found in the project directory')
      logInfo('Please make sure you are in a valid Node.js project directory')
      process.exit(1)
    }

    logSeparator()

    // Create progress bar
    const progress = createProgressBar(6)

    try {
      // Step 1: Detect package manager
      logStep(1, 'Detecting package manager...')
      const pmInfo = getPackageManagerInfo(projectPath)
      logPackageManager(pmInfo)
      progress.increment()

      // Step 2: Install release-it
      logStep(2, 'Installing release-it...')
      const installSuccess = installPackage('release-it', projectPath, {
        isDev: true,
      })
      if (!installSuccess) {
        logError('Failed to install release-it')
        process.exit(1)
      }
      logSuccess('release-it installed successfully')
      progress.increment()

      // Step 3: Copy .release-it.json
      logStep(3, 'Copying .release-it.json configuration...')
      const releaseItSuccess = copyTemplate(
        '.release-it.json',
        '.release-it.json',
        projectPath,
      )
      if (!releaseItSuccess) {
        logError('Failed to copy .release-it.json')
        process.exit(1)
      }
      logFileOperation('Created', '.release-it.json')
      progress.increment()

      // Step 4: Copy GitHub Actions workflow
      logStep(4, 'Setting up GitHub Actions workflow...')
      ensureDirectory('.github/workflows', projectPath)
      const workflowSuccess = copyTemplate(
        'release.yml',
        '.github/workflows/release.yml',
        projectPath,
      )
      if (!workflowSuccess) {
        logError('Failed to copy GitHub Actions workflow')
        process.exit(1)
      }
      logFileOperation('Created', '.github/workflows/release.yml')
      progress.increment()

      // Step 5: Create scripts directory and npm-publish-tool script
      logStep(5, 'Creating scripts and CLI tool...')
      const scriptsSuccess = createScriptsDirectory(projectPath)
      if (!scriptsSuccess) {
        logError('Failed to create scripts directory')
        process.exit(1)
      }
      logFileOperation('Created', 'scripts/npm-publish-tool.mjs')
      progress.increment()

      // Step 6: Add script to package.json
      logStep(6, 'Adding push-release-commit script to package.json...')
      const scriptSuccess = addPackageScript(
        'push-release-commit',
        'node ./scripts/npm-publish-tool.mjs',
        projectPath,
      )
      if (!scriptSuccess) {
        logError('Failed to add script to package.json')
        process.exit(1)
      }
      logFileOperation(
        'Updated',
        'package.json (added push-release-commit script)',
      )
      progress.complete()

      // Success!
      logSeparator()
      logCompletion()
    } catch (error) {
      logError(`Setup failed: ${error.message}`)
      process.exit(1)
    }
  })

// Show help if no command is provided
if (process.argv.length === 2) {
  program.help()
}

program.parse(process.argv)
