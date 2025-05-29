#!/usr/bin/env node

import fs from 'fs'
import { execSync } from 'child_process'
import { select } from '@inquirer/prompts'

/**
 * Script to create a release commit for npm-publish-tool
 * This script allows user to select Major, Minor, or Patch version increment,
 * updates package.json automatically, and creates a commit with the message "release v{version}"
 */

// セマンティックバージョニングに従ってバージョンを増加する関数
function incrementVersion(version, type) {
  const parts = version.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid version format. Expected MAJOR.MINOR.PATCH')
  }

  let [major, minor, patch] = parts.map((num) => parseInt(num, 10))

  switch (type) {
    case 'major':
      major += 1
      minor = 0
      patch = 0
      break
    case 'minor':
      major = major
      minor += 1
      patch = 0
      break
    case 'patch':
      major = major
      minor = minor
      patch += 1
      break
    default:
      throw new Error(
        'Invalid increment type. Use "major", "minor", or "patch"',
      )
  }

  return `${major}.${minor}.${patch}`
}

try {
  // Read package.json to get the current version
  const packageJsonPath = './package.json'
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: package.json not found in current directory')
    process.exit(1)
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const currentVersion = packageJson.version

  if (!currentVersion) {
    console.error('❌ Error: No version found in package.json')
    process.exit(1)
  }

  console.log(`📋 Current version: ${currentVersion}`)

  // Display current version breakdown
  console.log(`      │ │ │`)
  console.log(`      │ │ └─ Patch`)
  console.log(`      │ └─── Minor`)
  console.log(`      └───── Major`)

  // Get user choice for version increment using inquirer select
  const versionType = await select({
    message: '📦 Select version increment type:',
    choices: [
      {
        name: '🔴 Major (breaking changes)',
        value: 'major',
        description: 'Incompatible API changes (1.0.0 → 2.0.0)',
      },
      {
        name: '🟡 Minor (new features)',
        value: 'minor',
        description: 'Backwards-compatible functionality (1.0.0 → 1.1.0)',
      },
      {
        name: '🟢 Patch (bug fixes)',
        value: 'patch',
        description: 'Backwards-compatible bug fixes (1.0.0 → 1.0.1)',
      },
    ],
  })

  // Calculate new version
  const newVersion = incrementVersion(currentVersion, versionType)

  console.log(
    `🚀 Updating version from ${currentVersion} to ${newVersion} (${versionType} increment)`,
  )

  // Update package.json with new version
  packageJson.version = newVersion
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

  console.log(`📦 Updated package.json with version ${newVersion}`)

  // Add all changes
  execSync('git add --all', { stdio: 'inherit' })

  // Commit with release message
  const commitMessage = `release v${newVersion}`
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' })

  console.log(`✅ Release commit created: ${commitMessage}`)

  // Push to remote
  execSync('git push', { stdio: 'inherit' })

  console.log('🚀 Changes pushed to remote repository')
} catch (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}
