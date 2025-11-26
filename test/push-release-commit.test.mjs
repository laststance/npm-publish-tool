import { describe, it, expect } from 'vitest'
import { render } from '@inquirer/testing'
import { select } from '@inquirer/prompts'
import {
  incrementVersion,
  createVersionChoices,
} from '../push-release-commit.mjs'

describe('incrementVersion', () => {
  describe('patch increment', () => {
    it('increments patch version', () => {
      expect(incrementVersion('1.0.0', 'patch')).toBe('1.0.1')
    })

    it('increments patch from non-zero values', () => {
      expect(incrementVersion('2.5.3', 'patch')).toBe('2.5.4')
    })

    it('handles large patch numbers', () => {
      expect(incrementVersion('1.0.99', 'patch')).toBe('1.0.100')
    })
  })

  describe('minor increment', () => {
    it('increments minor version and resets patch', () => {
      expect(incrementVersion('1.0.0', 'minor')).toBe('1.1.0')
    })

    it('resets patch to 0 when incrementing minor', () => {
      expect(incrementVersion('2.5.3', 'minor')).toBe('2.6.0')
    })

    it('handles large minor numbers', () => {
      expect(incrementVersion('1.99.5', 'minor')).toBe('1.100.0')
    })
  })

  describe('major increment', () => {
    it('increments major version and resets minor and patch', () => {
      expect(incrementVersion('1.0.0', 'major')).toBe('2.0.0')
    })

    it('resets minor and patch to 0 when incrementing major', () => {
      expect(incrementVersion('2.5.3', 'major')).toBe('3.0.0')
    })

    it('handles large major numbers', () => {
      expect(incrementVersion('99.5.3', 'major')).toBe('100.0.0')
    })
  })

  describe('error handling', () => {
    it('throws error for invalid version format - too few parts', () => {
      expect(() => incrementVersion('1.0', 'patch')).toThrow(
        'Invalid version format. Expected MAJOR.MINOR.PATCH',
      )
    })

    it('throws error for invalid version format - too many parts', () => {
      expect(() => incrementVersion('1.0.0.0', 'patch')).toThrow(
        'Invalid version format. Expected MAJOR.MINOR.PATCH',
      )
    })

    it('throws error for invalid increment type', () => {
      expect(() => incrementVersion('1.0.0', 'invalid')).toThrow(
        'Invalid increment type. Use "major", "minor", or "patch"',
      )
    })

    it('throws error for undefined increment type', () => {
      expect(() => incrementVersion('1.0.0', undefined)).toThrow(
        'Invalid increment type. Use "major", "minor", or "patch"',
      )
    })

    it('throws error for null increment type', () => {
      expect(() => incrementVersion('1.0.0', null)).toThrow(
        'Invalid increment type. Use "major", "minor", or "patch"',
      )
    })
  })

  describe('edge cases', () => {
    it('handles version starting with 0', () => {
      expect(incrementVersion('0.0.1', 'patch')).toBe('0.0.2')
      expect(incrementVersion('0.1.0', 'minor')).toBe('0.2.0')
      expect(incrementVersion('0.1.0', 'major')).toBe('1.0.0')
    })

    it('handles prerelease-like versions (numbers only)', () => {
      expect(incrementVersion('1.0.0', 'patch')).toBe('1.0.1')
    })
  })
})

describe('createVersionChoices', () => {
  it('returns array with 3 choices', () => {
    const choices = createVersionChoices('1.0.0')
    expect(choices).toHaveLength(3)
  })

  it('returns correct values for each choice', () => {
    const choices = createVersionChoices('1.0.0')
    expect(choices[0].value).toBe('patch')
    expect(choices[1].value).toBe('minor')
    expect(choices[2].value).toBe('major')
  })

  it('includes emoji indicators in names', () => {
    const choices = createVersionChoices('1.0.0')
    expect(choices[0].name).toContain('🟢')
    expect(choices[0].name).toContain('Patch')
    expect(choices[1].name).toContain('🟡')
    expect(choices[1].name).toContain('Minor')
    expect(choices[2].name).toContain('🔴')
    expect(choices[2].name).toContain('Major')
  })

  it('calculates correct preview versions in descriptions', () => {
    const choices = createVersionChoices('1.2.3')
    // Patch: 1.2.4
    expect(choices[0].description).toContain('4')
    // Minor: 1.3.0
    expect(choices[1].description).toContain('3')
    // Major: 2.0.0
    expect(choices[2].description).toContain('2')
  })

  it('includes current version in all descriptions', () => {
    const currentVersion = '5.10.15'
    const choices = createVersionChoices(currentVersion)
    choices.forEach((choice) => {
      expect(choice.description).toContain(currentVersion)
    })
  })

  it('handles version 0.0.0', () => {
    const choices = createVersionChoices('0.0.0')
    expect(choices[0].description).toContain('1') // patch: 0.0.1
    expect(choices[1].description).toContain('1') // minor: 0.1.0
    expect(choices[2].description).toContain('1') // major: 1.0.0
  })
})

describe('interactive version selection prompt', () => {
  it('selects patch version (first option) by pressing enter', async () => {
    const choices = createVersionChoices('1.0.0')
    const { answer, events } = await render(select, {
      message: '📦 Select version increment type:',
      choices,
    })

    // Press enter to select first option (patch)
    events.keypress('enter')

    await expect(answer).resolves.toBe('patch')
  })

  it('selects minor version by navigating down once', async () => {
    const choices = createVersionChoices('1.0.0')
    const { answer, events } = await render(select, {
      message: '📦 Select version increment type:',
      choices,
    })

    // Navigate down to minor, then select
    events.keypress('down')
    events.keypress('enter')

    await expect(answer).resolves.toBe('minor')
  })

  it('selects major version by navigating down twice', async () => {
    const choices = createVersionChoices('1.0.0')
    const { answer, events } = await render(select, {
      message: '📦 Select version increment type:',
      choices,
    })

    // Navigate down twice to major, then select
    events.keypress('down')
    events.keypress('down')
    events.keypress('enter')

    await expect(answer).resolves.toBe('major')
  })

  it('displays correct message in prompt', async () => {
    const choices = createVersionChoices('2.5.3')
    const { getScreen } = await render(select, {
      message: '📦 Select version increment type:',
      choices,
    })

    const screen = getScreen()
    expect(screen).toContain('Select version increment type')
  })

  it('displays all version options', async () => {
    const choices = createVersionChoices('1.0.0')
    const { getScreen } = await render(select, {
      message: '📦 Select version increment type:',
      choices,
    })

    const screen = getScreen()
    expect(screen).toContain('Patch')
    expect(screen).toContain('Minor')
    expect(screen).toContain('Major')
  })

  it('can navigate up and down through options', async () => {
    const choices = createVersionChoices('1.0.0')
    const { answer, events } = await render(select, {
      message: '📦 Select version increment type:',
      choices,
    })

    // Navigate down to major
    events.keypress('down')
    events.keypress('down')
    // Navigate back up to minor
    events.keypress('up')
    events.keypress('enter')

    await expect(answer).resolves.toBe('minor')
  })

  it('wraps around when navigating past last option', async () => {
    const choices = createVersionChoices('1.0.0')
    const { answer, events } = await render(select, {
      message: '📦 Select version increment type:',
      choices,
    })

    // Navigate down 3 times (should wrap to first option)
    events.keypress('down')
    events.keypress('down')
    events.keypress('down')
    events.keypress('enter')

    // Should wrap back to patch (first option)
    await expect(answer).resolves.toBe('patch')
  })
})
