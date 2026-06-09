import { describe, it, expect } from 'vitest'
import { validateUsername, validateDisplayName, validateBio, validateLinkTitle, validateLinkUrl } from '../validation'

describe('validateUsername', () => {
  it('returns null for a valid username', () => {
    expect(validateUsername('vincent')).toBeNull()
    expect(validateUsername('my_profile')).toBeNull()
    expect(validateUsername('user-123')).toBeNull()
    expect(validateUsername('abc')).toBeNull()
  })

  it('rejects empty string', () => {
    expect(validateUsername('')?.message).toBe('Username is required.')
  })

  it('rejects username shorter than 3 characters', () => {
    expect(validateUsername('ab')?.message).toBe('Username must be at least 3 characters.')
    expect(validateUsername('a')?.message).toBe('Username must be at least 3 characters.')
  })

  it('rejects username longer than 30 characters', () => {
    expect(validateUsername('a'.repeat(31))?.message).toBe('Username must be 30 characters or less.')
  })

  it('accepts exactly 3 and 30 characters', () => {
    expect(validateUsername('abc')).toBeNull()
    expect(validateUsername('a'.repeat(30))).toBeNull()
  })

  it('rejects uppercase letters', () => {
    expect(validateUsername('MyProfile')?.message).toMatch(/lowercase/)
  })

  it('rejects spaces', () => {
    expect(validateUsername('my profile')?.message).toMatch(/lowercase/)
  })

  it('rejects special characters other than dash and underscore', () => {
    expect(validateUsername('my@profile')?.message).toMatch(/lowercase/)
    expect(validateUsername('my.profile')?.message).toMatch(/lowercase/)
  })

  it('allows dashes and underscores', () => {
    expect(validateUsername('my-profile')).toBeNull()
    expect(validateUsername('my_profile')).toBeNull()
  })
})

describe('validateDisplayName', () => {
  it('returns null for valid display names', () => {
    expect(validateDisplayName('Vincent Xu')).toBeNull()
    expect(validateDisplayName('A')).toBeNull()
  })

  it('rejects empty string', () => {
    expect(validateDisplayName('')?.message).toBe('Display name is required.')
  })

  it('rejects whitespace-only string', () => {
    expect(validateDisplayName('   ')?.message).toBe('Display name is required.')
  })

  it('rejects display names longer than 50 characters', () => {
    expect(validateDisplayName('A'.repeat(51))?.message).toBe('Display name must be 50 characters or less.')
  })

  it('accepts exactly 50 characters', () => {
    expect(validateDisplayName('A'.repeat(50))).toBeNull()
  })
})

describe('validateBio', () => {
  it('returns null for empty bio', () => {
    expect(validateBio('')).toBeNull()
  })

  it('returns null for bio within 160 characters', () => {
    expect(validateBio('A'.repeat(160))).toBeNull()
    expect(validateBio('Short bio here.')).toBeNull()
  })

  it('rejects bio longer than 160 characters', () => {
    expect(validateBio('A'.repeat(161))?.message).toBe('Bio must be 160 characters or less.')
  })
})

describe('validateLinkTitle', () => {
  it('returns null for valid titles', () => {
    expect(validateLinkTitle('My Instagram')).toBeNull()
    expect(validateLinkTitle('A')).toBeNull()
  })

  it('rejects empty string', () => {
    expect(validateLinkTitle('')?.message).toBe('Link title is required.')
  })

  it('rejects whitespace-only string', () => {
    expect(validateLinkTitle('   ')?.message).toBe('Link title is required.')
  })

  it('rejects titles longer than 80 characters', () => {
    expect(validateLinkTitle('A'.repeat(81))?.message).toBe('Link title must be 80 characters or less.')
  })

  it('accepts exactly 80 characters', () => {
    expect(validateLinkTitle('A'.repeat(80))).toBeNull()
  })
})

describe('validateLinkUrl', () => {
  it('returns null for valid https URLs', () => {
    expect(validateLinkUrl('https://instagram.com/user')).toBeNull()
    expect(validateLinkUrl('https://example.com')).toBeNull()
  })

  it('returns null for valid http URLs', () => {
    expect(validateLinkUrl('http://example.com')).toBeNull()
  })

  it('rejects empty string', () => {
    expect(validateLinkUrl('')?.message).toBe('URL is required.')
  })

  it('rejects whitespace-only string', () => {
    expect(validateLinkUrl('   ')?.message).toBe('URL is required.')
  })

  it('rejects bare domains without protocol', () => {
    expect(validateLinkUrl('instagram.com')?.message).toBe('Please enter a valid URL.')
  })

  it('rejects javascript: protocol', () => {
    expect(validateLinkUrl('javascript:alert(1)')?.message).toBe('This URL is not allowed.')
  })

  it('rejects data: protocol', () => {
    expect(validateLinkUrl('data:text/html,<h1>x</h1>')?.message).toBe('This URL is not allowed.')
  })

  it('rejects file: protocol', () => {
    expect(validateLinkUrl('file:///etc/passwd')?.message).toBe('This URL is not allowed.')
  })

  it('rejects vbscript: protocol', () => {
    expect(validateLinkUrl('vbscript:msgbox(1)')?.message).toBe('This URL is not allowed.')
  })

  it('rejects non-URL strings', () => {
    expect(validateLinkUrl('not a url')?.message).toBe('Please enter a valid URL.')
  })
})
