import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import {
  copyTemplate,
  addPackageScript,
  createScriptsDirectory,
  fileExists,
  ensureDirectory,
} from '../lib/fileOperations.mjs'

// Mock fs module
vi.mock('fs')
vi.mock('path')

// Mock console methods
const mockConsoleError = vi.fn()

describe('fileOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(mockConsoleError)

    // Default path behavior
    path.join.mockImplementation((...args) => args.join('/'))
    path.dirname.mockImplementation((filePath) =>
      filePath.split('/').slice(0, -1).join('/'),
    )
    path.resolve.mockImplementation((...args) => `resolved/${args.join('/')}`)

    // Mock process.cwd()
    vi.spyOn(process, 'cwd').mockReturnValue('/mock/cwd')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('copyTemplate', () => {
    it('should successfully copy template file', () => {
      fs.mkdirSync.mockImplementation(() => {})
      fs.copyFileSync.mockImplementation(() => {})

      const result = copyTemplate('test.txt', 'dest/test.txt', '/project')

      expect(fs.mkdirSync).toHaveBeenCalledWith('/project/dest', {
        recursive: true,
      })
      expect(fs.copyFileSync).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should use default project path when not provided', () => {
      fs.mkdirSync.mockImplementation(() => {})
      fs.copyFileSync.mockImplementation(() => {})

      copyTemplate('test.txt', 'dest/test.txt')

      expect(path.join).toHaveBeenCalledWith('/mock/cwd', 'dest/test.txt')
    })

    it('should handle errors during directory creation', () => {
      const error = new Error('Permission denied')
      fs.mkdirSync.mockImplementation(() => {
        throw error
      })

      const result = copyTemplate('test.txt', 'dest/test.txt')

      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ Failed to copy test.txt:',
        'Permission denied',
      )
      expect(result).toBe(false)
    })

    it('should handle errors during file copy', () => {
      fs.mkdirSync.mockImplementation(() => {})
      const error = new Error('File not found')
      fs.copyFileSync.mockImplementation(() => {
        throw error
      })

      const result = copyTemplate('missing.txt', 'dest/missing.txt')

      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ Failed to copy missing.txt:',
        'File not found',
      )
      expect(result).toBe(false)
    })

    it('should create target directory recursively', () => {
      fs.mkdirSync.mockImplementation(() => {})
      fs.copyFileSync.mockImplementation(() => {})

      copyTemplate('test.txt', 'deep/nested/path/test.txt')

      expect(fs.mkdirSync).toHaveBeenCalledWith('/mock/cwd/deep/nested/path', {
        recursive: true,
      })
    })
  })

  describe('addPackageScript', () => {
    const mockPackageJson = {
      name: 'test-package',
      version: '1.0.0',
      scripts: {
        start: 'node index.js',
      },
    }

    it('should add script to existing package.json', () => {
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson))
      fs.writeFileSync.mockImplementation(() => {})

      const result = addPackageScript('test', 'echo "test"', '/project')

      expect(fs.readFileSync).toHaveBeenCalledWith(
        '/project/package.json',
        'utf8',
      )
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/project/package.json',
        expect.stringContaining('"test": "echo \\"test\\""'),
      )
      expect(result).toBe(true)
    })

    it('should create scripts object if it does not exist', () => {
      const packageWithoutScripts = { name: 'test', version: '1.0.0' }
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(JSON.stringify(packageWithoutScripts))
      fs.writeFileSync.mockImplementation(() => {})

      const result = addPackageScript('build', 'webpack')

      expect(result).toBe(true)
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"scripts"'),
      )
    })

    it('should handle missing package.json', () => {
      fs.existsSync.mockReturnValue(false)

      const result = addPackageScript('test', 'echo "test"')

      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ package.json not found in project directory',
      )
      expect(result).toBe(false)
    })

    it('should handle invalid JSON in package.json', () => {
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue('invalid json')

      const result = addPackageScript('test', 'echo "test"')

      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ Failed to add script to package.json:',
        expect.any(String),
      )
      expect(result).toBe(false)
    })

    it('should handle write errors', () => {
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson))
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })

      const result = addPackageScript('test', 'echo "test"')

      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ Failed to add script to package.json:',
        'Permission denied',
      )
      expect(result).toBe(false)
    })

    it('should format JSON with proper indentation', () => {
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson))
      fs.writeFileSync.mockImplementation(() => {})

      addPackageScript('test', 'echo "test"')

      const writeCall = fs.writeFileSync.mock.calls[0]
      const writtenContent = writeCall[1]

      // Should have proper indentation and end with newline
      expect(writtenContent).toMatch(/{\n  /)
      expect(writtenContent.endsWith('\n')).toBe(true)
    })

    it('should use default project path', () => {
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson))
      fs.writeFileSync.mockImplementation(() => {})

      addPackageScript('test', 'echo "test"')

      expect(path.join).toHaveBeenCalledWith('/mock/cwd', 'package.json')
    })
  })

  describe('createScriptsDirectory', () => {
    it('should create scripts directory and copy script', () => {
      fs.existsSync.mockReturnValue(false)
      fs.mkdirSync.mockImplementation(() => {})
      fs.copyFileSync.mockImplementation(() => {})
      fs.chmodSync.mockImplementation(() => {})

      const result = createScriptsDirectory('/project')

      expect(fs.mkdirSync).toHaveBeenCalledWith('/project/scripts', {
        recursive: true,
      })
      expect(fs.copyFileSync).toHaveBeenCalled()
      expect(fs.chmodSync).toHaveBeenCalledWith(
        '/project/scripts/npm-publish-tool.mjs',
        '755',
      )
      expect(result).toBe(true)
    })

    it('should handle scripts directory that already exists', () => {
      fs.existsSync.mockReturnValue(true)
      fs.copyFileSync.mockImplementation(() => {})
      fs.chmodSync.mockImplementation(() => {})
      fs.mkdirSync.mockImplementation(() => {})

      createScriptsDirectory('/project')

      // The scripts directory creation should be skipped, but copyTemplate
      // will still call mkdirSync for its target directory
      expect(fs.mkdirSync).toHaveBeenCalled() // Because copyTemplate calls it
    })

    it('should handle errors during directory creation', () => {
      fs.existsSync.mockReturnValue(false)
      fs.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })

      const result = createScriptsDirectory('/project')

      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ Failed to create scripts directory:',
        'Permission denied',
      )
      expect(result).toBe(false)
    })

    it('should return false if template copy fails', () => {
      fs.existsSync.mockReturnValue(false)
      fs.mkdirSync.mockImplementation(() => {})
      fs.copyFileSync.mockImplementation(() => {
        throw new Error('Copy failed')
      })

      const result = createScriptsDirectory('/project')

      // The function should handle the error from copyTemplate
      expect(result).toBe(false)
    })

    it('should use default project path', () => {
      fs.existsSync.mockReturnValue(false)
      fs.mkdirSync.mockImplementation(() => {})
      fs.copyFileSync.mockImplementation(() => {})
      fs.chmodSync.mockImplementation(() => {})

      createScriptsDirectory()

      expect(path.join).toHaveBeenCalledWith('/mock/cwd', 'scripts')
    })

    it('should make script executable after copying', () => {
      fs.existsSync.mockReturnValue(false)
      fs.mkdirSync.mockImplementation(() => {})
      fs.copyFileSync.mockImplementation(() => {})
      fs.chmodSync.mockImplementation(() => {})

      createScriptsDirectory('/project')

      expect(fs.chmodSync).toHaveBeenCalledWith(
        '/project/scripts/npm-publish-tool.mjs',
        '755',
      )
    })
  })

  describe('fileExists', () => {
    it('should return true when file exists', () => {
      fs.existsSync.mockReturnValue(true)

      const result = fileExists('package.json', '/project')

      expect(fs.existsSync).toHaveBeenCalledWith('/project/package.json')
      expect(result).toBe(true)
    })

    it('should return false when file does not exist', () => {
      fs.existsSync.mockReturnValue(false)

      const result = fileExists('missing.txt', '/project')

      expect(fs.existsSync).toHaveBeenCalledWith('/project/missing.txt')
      expect(result).toBe(false)
    })

    it('should use default project path', () => {
      fs.existsSync.mockReturnValue(true)

      fileExists('test.txt')

      expect(path.join).toHaveBeenCalledWith('/mock/cwd', 'test.txt')
    })

    it('should handle nested file paths', () => {
      fs.existsSync.mockReturnValue(true)

      fileExists('src/components/Button.tsx', '/project')

      expect(path.join).toHaveBeenCalledWith(
        '/project',
        'src/components/Button.tsx',
      )
    })
  })

  describe('ensureDirectory', () => {
    it('should create directory successfully', () => {
      fs.mkdirSync.mockImplementation(() => {})

      const result = ensureDirectory('new-dir', '/project')

      expect(fs.mkdirSync).toHaveBeenCalledWith('/project/new-dir', {
        recursive: true,
      })
      expect(result).toBe(true)
    })

    it('should handle errors during directory creation', () => {
      fs.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })

      const result = ensureDirectory('new-dir', '/project')

      expect(mockConsoleError).toHaveBeenCalledWith(
        '❌ Failed to create directory new-dir:',
        'Permission denied',
      )
      expect(result).toBe(false)
    })

    it('should use default project path', () => {
      fs.mkdirSync.mockImplementation(() => {})

      ensureDirectory('test-dir')

      expect(path.join).toHaveBeenCalledWith('/mock/cwd', 'test-dir')
    })

    it('should create nested directories', () => {
      fs.mkdirSync.mockImplementation(() => {})

      ensureDirectory('deep/nested/path', '/project')

      expect(fs.mkdirSync).toHaveBeenCalledWith('/project/deep/nested/path', {
        recursive: true,
      })
    })

    it('should not fail if directory already exists', () => {
      // mkdirSync with recursive: true should not throw if directory exists
      fs.mkdirSync.mockImplementation(() => {})

      const result = ensureDirectory('existing-dir', '/project')

      expect(result).toBe(true)
    })
  })
})
