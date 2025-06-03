#!/usr/bin/env node

import { Command } from 'commander'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

// Import utility modules
import { installPackage, getPackageManagerInfo } from './lib/packageManager.mjs'
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
  .command('init')
  .description('Initialize release-it configuration in your project')
  .option('-p, --path <path>', 'Project path', process.cwd())
  .action(async (options) => {
    const projectPath = path.resolve(options.path)

    logHeader('NPM Publish Tool Initialization')
    logInfo(`Initializing release-it configuration in: ${projectPath}`)

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

    // Create progress bar with updated total (9 steps now)
    const progress = createProgressBar(9)

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

      // Step 3: Install ora (required for npm-publish-tool script)
      logStep(3, 'Installing ora...')
      const oraSuccess = installPackage('ora', projectPath, {
        isDev: true,
      })
      if (!oraSuccess) {
        logError('Failed to install ora')
        process.exit(1)
      }
      logSuccess('ora installed successfully')
      progress.increment()

      // Step 4: Install @inquirer/prompts (required for npm-publish-tool script)
      logStep(4, 'Installing @inquirer/prompts...')
      const inquirerSuccess = installPackage('@inquirer/prompts', projectPath, {
        isDev: true,
      })
      if (!inquirerSuccess) {
        logError('Failed to install @inquirer/prompts')
        process.exit(1)
      }
      logSuccess('@inquirer/prompts installed successfully')
      progress.increment()

      // Step 5: Copy .release-it.json
      logStep(5, 'Copying .release-it.json configuration...')
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

      // Step 6: Copy GitHub Actions workflow
      logStep(6, 'Setting up GitHub Actions workflow...')
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

      // Step 7: Create scripts directory and npm-publish-tool script
      logStep(7, 'Creating scripts and CLI tool...')
      const scriptsSuccess = createScriptsDirectory(projectPath)
      if (!scriptsSuccess) {
        logError('Failed to create scripts directory')
        process.exit(1)
      }
      logFileOperation('Created', 'scripts/npm-publish-tool.mjs')
      progress.increment()

      // Step 8: Add script to package.json
      logStep(8, 'Adding push-release-commit script to package.json...')
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
      logError(`Initialization failed: ${error.message}`)
      process.exit(1)
    }
  })

// Show help if no command is provided
if (process.argv.length === 2) {
  program.help()
}

program.parse(process.argv)
