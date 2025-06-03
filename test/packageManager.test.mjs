import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import {
  detectPackageManager,
  installPackage,
  getPackageManagerInfo,
} from '../lib/packageManager.mjs'

// Mock modules
vi.mock('fs')
vi.mock('path')
vi.mock('child_process')

const mockConsoleLog = vi.fn()

describe('packageManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(mockConsoleLog)
    vi.spyOn(process, 'cwd').mockReturnValue('/mock/cwd')

    // Default path behavior
    path.join.mockImplementation((...args) => args.join('/'))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('detectPackageManager', () => {
    it('should detect pnpm when pnpm-lock.yaml exists', () => {
      fs.existsSync.mockImplementation((filePath) => {
        return filePath.includes('pnpm-lock.yaml')
      })

      const result = detectPackageManager('/project')

      expect(fs.existsSync).toHaveBeenCalledWith('/project/pnpm-lock.yaml')
      expect(result).toBe('pnpm')
    })

    it('should detect yarn when yarn.lock exists and pnpm-lock.yaml does not', () => {
      fs.existsSync.mockImplementation((filePath) => {
        return filePath.includes('yarn.lock')
      })

      const result = detectPackageManager('/project')

      expect(fs.existsSync).toHaveBeenCalledWith('/project/pnpm-lock.yaml')
      expect(fs.existsSync).toHaveBeenCalledWith('/project/yarn.lock')
      expect(result).toBe('yarn')
    })

    it('should detect npm when package-lock.json exists and others do not', () => {
      fs.existsSync.mockImplementation((filePath) => {
        return filePath.includes('package-lock.json')
      })

      const result = detectPackageManager('/project')

      expect(fs.existsSync).toHaveBeenCalledWith('/project/pnpm-lock.yaml')
      expect(fs.existsSync).toHaveBeenCalledWith('/project/yarn.lock')
      expect(fs.existsSync).toHaveBeenCalledWith('/project/package-lock.json')
      expect(result).toBe('npm')
    })

    it('should default to npm when no lock files exist', () => {
      fs.existsSync.mockReturnValue(false)

      const result = detectPackageManager('/project')

      expect(result).toBe('npm')
    })

    it('should use default project path when not provided', () => {
      fs.existsSync.mockReturnValue(false)

      detectPackageManager()

      expect(path.join).toHaveBeenCalledWith('/mock/cwd', 'pnpm-lock.yaml')
    })

    it('should prioritize pnpm over other package managers', () => {
      fs.existsSync.mockImplementation((filePath) => {
        // All lock files exist, but pnpm should win
        return true
      })

      const result = detectPackageManager('/project')

      expect(result).toBe('pnpm')
    })

    it('should prioritize yarn over npm when both exist', () => {
      fs.existsSync.mockImplementation((filePath) => {
        return (
          filePath.includes('yarn.lock') ||
          filePath.includes('package-lock.json')
        )
      })

      const result = detectPackageManager('/project')

      expect(result).toBe('yarn')
    })
  })

  describe('installPackage', () => {
    beforeEach(() => {
      fs.existsSync.mockReturnValue(false) // Default to npm
      execSync.mockImplementation(() => {})
    })

    it('should install package with npm by default', () => {
      installPackage('vitest', '/project')

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '📦 Installing vitest using npm...',
      )
      expect(execSync).toHaveBeenCalledWith('npm install vitest', {
        cwd: '/project',
        stdio: 'inherit',
      })
    })

    it('should install dev dependency with npm', () => {
      installPackage('vitest', '/project', { isDev: true })

      expect(execSync).toHaveBeenCalledWith('npm install vitest --save-dev', {
        cwd: '/project',
        stdio: 'inherit',
      })
    })

    it('should install package with pnpm when pnpm-lock.yaml exists', () => {
      fs.existsSync.mockImplementation((filePath) => {
        return filePath.includes('pnpm-lock.yaml')
      })

      installPackage('vitest', '/project')

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '📦 Installing vitest using pnpm...',
      )
      expect(execSync).toHaveBeenCalledWith('pnpm add vitest', {
        cwd: '/project',
        stdio: 'inherit',
      })
    })

    it('should install dev dependency with pnpm', () => {
      fs.existsSync.mockImplementation((filePath) => {
        return filePath.includes('pnpm-lock.yaml')
      })

      installPackage('vitest', '/project', { isDev: true })

      expect(execSync).toHaveBeenCalledWith('pnpm add vitest --save-dev', {
        cwd: '/project',
        stdio: 'inherit',
      })
    })

    it('should install package with yarn when yarn.lock exists', () => {
      fs.existsSync.mockImplementation((filePath) => {
        return filePath.includes('yarn.lock')
      })

      installPackage('vitest', '/project')

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '📦 Installing vitest using yarn...',
      )
      expect(execSync).toHaveBeenCalledWith('yarn add vitest', {
        cwd: '/project',
        stdio: 'inherit',
      })
    })

    it('should install dev dependency with yarn', () => {
      fs.existsSync.mockImplementation((filePath) => {
        return filePath.includes('yarn.lock')
      })

      installPackage('vitest', '/project', { isDev: true })

      expect(execSync).toHaveBeenCalledWith('yarn add vitest --dev', {
        cwd: '/project',
        stdio: 'inherit',
      })
    })

    it('should use default project path when not provided', () => {
      installPackage('vitest')

      expect(execSync).toHaveBeenCalledWith('npm install vitest', {
        cwd: '/mock/cwd',
        stdio: 'inherit',
      })
    })

    it('should handle installation errors', () => {
      const mockConsoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      execSync.mockImplementation(() => {
        throw new Error('Installation failed')
      })

      const result = installPackage('invalid-package', '/project')

      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ Failed to install invalid-package:',
        'Installation failed',
      )
      expect(result).toBe(false)
    })

    it('should return true on successful installation', () => {
      execSync.mockImplementation(() => {})

      const result = installPackage('vitest', '/project')

      expect(result).toBe(true)
    })

    it('should handle empty options object', () => {
      installPackage('vitest', '/project', {})

      expect(execSync).toHaveBeenCalledWith('npm install vitest', {
        cwd: '/project',
        stdio: 'inherit',
      })
    })

    it('should handle undefined options', () => {
      installPackage('vitest', '/project', undefined)

      expect(execSync).toHaveBeenCalledWith('npm install vitest', {
        cwd: '/project',
        stdio: 'inherit',
      })
    })

    it('should install multiple packages with spaces in name', () => {
      installPackage('@types/node', '/project')

      expect(execSync).toHaveBeenCalledWith('npm install @types/node', {
        cwd: '/project',
        stdio: 'inherit',
      })
    })
  })

  describe('getPackageManagerInfo', () => {
    beforeEach(() => {
      fs.existsSync.mockReturnValue(false) // Default to npm
    })

    it('should get npm version info', () => {
      execSync.mockReturnValue('8.19.2\n')

      const result = getPackageManagerInfo('/project')

      expect(execSync).toHaveBeenCalledWith('npm --version', {
        cwd: '/project',
        encoding: 'utf8',
        stdio: 'pipe',
      })
      expect(result).toEqual({
        name: 'npm',
        version: '8.19.2',
      })
    })

    it('should get pnpm version info', () => {
      fs.existsSync.mockImplementation((filePath) => {
        return filePath.includes('pnpm-lock.yaml')
      })
      execSync.mockReturnValue('7.15.0\n')

      const result = getPackageManagerInfo('/project')

      expect(execSync).toHaveBeenCalledWith('pnpm --version', {
        cwd: '/project',
        encoding: 'utf8',
        stdio: 'pipe',
      })
      expect(result).toEqual({
        name: 'pnpm',
        version: '7.15.0',
      })
    })

    it('should get yarn version info', () => {
      fs.existsSync.mockImplementation((filePath) => {
        return filePath.includes('yarn.lock')
      })
      execSync.mockReturnValue('1.22.19\n')

      const result = getPackageManagerInfo('/project')

      expect(execSync).toHaveBeenCalledWith('yarn --version', {
        cwd: '/project',
        encoding: 'utf8',
        stdio: 'pipe',
      })
      expect(result).toEqual({
        name: 'yarn',
        version: '1.22.19',
      })
    })

    it('should handle version command errors', () => {
      execSync.mockImplementation(() => {
        throw new Error('Command not found')
      })

      const result = getPackageManagerInfo('/project')

      expect(result).toEqual({
        name: 'npm',
        version: 'unknown',
      })
    })

    it('should use default project path when not provided', () => {
      execSync.mockReturnValue('8.19.2\n')

      getPackageManagerInfo()

      expect(execSync).toHaveBeenCalledWith('npm --version', {
        cwd: '/mock/cwd',
        encoding: 'utf8',
        stdio: 'pipe',
      })
    })

    it('should trim whitespace from version output', () => {
      execSync.mockReturnValue('  8.19.2  \n\t')

      const result = getPackageManagerInfo('/project')

      expect(result.version).toBe('8.19.2')
    })

    it('should handle empty version output', () => {
      execSync.mockReturnValue('')

      const result = getPackageManagerInfo('/project')

      expect(result.version).toBe('')
    })

    it('should handle complex version output', () => {
      execSync.mockReturnValue('v18.17.0\n')

      const result = getPackageManagerInfo('/project')

      expect(result.version).toBe('v18.17.0')
    })

    it('should preserve package manager name even on version error', () => {
      fs.existsSync.mockImplementation((filePath) => {
        return filePath.includes('pnpm-lock.yaml')
      })
      execSync.mockImplementation(() => {
        throw new Error('Command failed')
      })

      const result = getPackageManagerInfo('/project')

      expect(result).toEqual({
        name: 'pnpm',
        version: 'unknown',
      })
    })
  })
})
