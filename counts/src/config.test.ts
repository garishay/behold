// @vitest-environment node
// The test reads the Worker's configuration from disk under Vitest, which runs on Node; the
// Worker's project declares no Node types, so this file brings them in itself, as the registry
// test does.
/// <reference types="node" />
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/** `wrangler.jsonc` as wrangler reads it: JSON with comments and trailing commas. */
const config = ts.parseConfigFileTextToJson(
  'wrangler.jsonc',
  readFileSync('counts/wrangler.jsonc', 'utf8'),
).config as Record<string, unknown>

describe('the count service’s configuration (#7)', () => {
  // Gate 41 A7 as ruled: the service keeps no log, as the passage service keeps none, so its
  // stored request logs are off, and nothing else carries its requests away to be kept.
  it('keeps no log of a request', () => {
    expect(config.observability).toEqual({ enabled: false })
    expect(config).not.toHaveProperty('logpush')
    expect(config).not.toHaveProperty('tail_consumers')
  })
})
