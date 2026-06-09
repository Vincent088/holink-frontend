import { describe, it, expect } from 'vitest'
import { normalizeUrl, isValidUrl, detectPlatform, buildUtmUrl, getDomain } from '../url'

describe('normalizeUrl', () => {
  it('returns empty string for empty input', () => {
    expect(normalizeUrl('')).toBe('')
    expect(normalizeUrl('   ')).toBe('')
  })

  it('leaves https:// URLs untouched', () => {
    expect(normalizeUrl('https://instagram.com/user')).toBe('https://instagram.com/user')
  })

  it('leaves http:// URLs untouched', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com')
  })

  it('prepends https:// to bare domains', () => {
    expect(normalizeUrl('instagram.com/user')).toBe('https://instagram.com/user')
    expect(normalizeUrl('youtube.com/@channel')).toBe('https://youtube.com/@channel')
  })

  it('trims whitespace before normalizing', () => {
    expect(normalizeUrl('  instagram.com/user  ')).toBe('https://instagram.com/user')
  })

  it('blocks javascript: protocol and returns empty string', () => {
    expect(normalizeUrl('javascript:alert(1)')).toBe('')
    expect(normalizeUrl('JAVASCRIPT:alert(1)')).toBe('')
  })

  it('blocks data: protocol and returns empty string', () => {
    expect(normalizeUrl('data:text/html,<h1>hi</h1>')).toBe('')
  })

  it('blocks file: protocol and returns empty string', () => {
    expect(normalizeUrl('file:///etc/passwd')).toBe('')
  })

  it('blocks vbscript: protocol and returns empty string', () => {
    expect(normalizeUrl('vbscript:msgbox(1)')).toBe('')
  })
})

describe('isValidUrl', () => {
  it('returns true for valid https URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('https://instagram.com/user')).toBe(true)
  })

  it('returns true for valid http URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true)
  })

  it('returns false for empty string', () => {
    expect(isValidUrl('')).toBe(false)
  })

  it('returns false for bare domain without protocol', () => {
    expect(isValidUrl('instagram.com')).toBe(false)
  })

  it('returns false for javascript: protocol', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false)
  })

  it('returns false for data: protocol', () => {
    expect(isValidUrl('data:text/html,<h1>hi</h1>')).toBe(false)
  })

  it('returns false for non-URL strings', () => {
    expect(isValidUrl('not a url')).toBe(false)
    expect(isValidUrl('ftp://files.example.com')).toBe(false)
  })
})

describe('detectPlatform', () => {
  it('detects Instagram', () => {
    expect(detectPlatform('https://instagram.com/user')).toBe('instagram')
    expect(detectPlatform('https://www.instagram.com/user')).toBe('instagram')
  })

  it('detects YouTube', () => {
    expect(detectPlatform('https://youtube.com/@channel')).toBe('youtube')
    expect(detectPlatform('https://www.youtube.com/watch?v=abc')).toBe('youtube')
  })

  it('detects TikTok', () => {
    expect(detectPlatform('https://tiktok.com/@user')).toBe('tiktok')
    expect(detectPlatform('https://www.tiktok.com/@user')).toBe('tiktok')
  })

  it('detects WhatsApp via wa.me', () => {
    expect(detectPlatform('https://wa.me/628123456789')).toBe('whatsapp')
  })

  it('detects WhatsApp via whatsapp.com', () => {
    expect(detectPlatform('https://whatsapp.com/channel/abc')).toBe('whatsapp')
  })

  it('detects Tokopedia as marketplace', () => {
    expect(detectPlatform('https://tokopedia.com/store')).toBe('marketplace')
  })

  it('detects Shopee as marketplace', () => {
    expect(detectPlatform('https://shopee.co.id/store')).toBe('marketplace')
  })

  it('detects Amazon as marketplace', () => {
    expect(detectPlatform('https://amazon.com/dp/B001')).toBe('marketplace')
  })

  it('detects Lazada as marketplace', () => {
    expect(detectPlatform('https://lazada.com/products/item')).toBe('marketplace')
  })

  it('returns website for generic domains', () => {
    expect(detectPlatform('https://myblog.com')).toBe('website')
    expect(detectPlatform('https://linktree.com/user')).toBe('website')
  })

  it('returns unknown for invalid URLs', () => {
    expect(detectPlatform('not-a-url')).toBe('unknown')
    expect(detectPlatform('')).toBe('unknown')
  })
})

describe('buildUtmUrl', () => {
  it('returns base URL unchanged when no UTM params provided', () => {
    const url = 'https://example.com'
    expect(buildUtmUrl(url, {})).toBe(url)
  })

  it('appends utm_source', () => {
    const result = buildUtmUrl('https://example.com', { utmSource: 'instagram' })
    expect(result).toContain('utm_source=instagram')
  })

  it('appends all three UTM params', () => {
    const result = buildUtmUrl('https://example.com', {
      utmSource: 'instagram',
      utmMedium: 'bio',
      utmCampaign: 'summer2025',
    })
    expect(result).toContain('utm_source=instagram')
    expect(result).toContain('utm_medium=bio')
    expect(result).toContain('utm_campaign=summer2025')
  })

  it('ignores empty/whitespace UTM values', () => {
    const result = buildUtmUrl('https://example.com', { utmSource: '  ', utmMedium: '' })
    expect(result).toBe('https://example.com')
  })

  it('trims whitespace from UTM values', () => {
    const result = buildUtmUrl('https://example.com', { utmSource: '  bio  ' })
    expect(result).toContain('utm_source=bio')
  })

  it('preserves existing query params on the URL', () => {
    const result = buildUtmUrl('https://example.com?ref=home', { utmSource: 'ig' })
    expect(result).toContain('ref=home')
    expect(result).toContain('utm_source=ig')
  })

  it('returns base URL unchanged if it is empty', () => {
    expect(buildUtmUrl('', { utmSource: 'ig' })).toBe('')
  })

  it('returns base URL unchanged if it is invalid', () => {
    const bad = 'not-a-url'
    expect(buildUtmUrl(bad, { utmSource: 'ig' })).toBe(bad)
  })
})

describe('getDomain', () => {
  it('extracts hostname from a URL', () => {
    expect(getDomain('https://instagram.com/user')).toBe('instagram.com')
  })

  it('strips www. prefix', () => {
    expect(getDomain('https://www.youtube.com/@channel')).toBe('youtube.com')
  })

  it('returns empty string for invalid URLs', () => {
    expect(getDomain('not-a-url')).toBe('')
    expect(getDomain('')).toBe('')
  })
})
