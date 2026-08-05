import { afterEach, describe, expect, it, vi } from 'vitest'

import { downloadCsv } from './csv'

describe('downloadCsv', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('builds a BOM-prefixed escaped CSV and triggers a download', async () => {
    let capturedBlob: Blob | null = null
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      capturedBlob = blob as Blob
      return 'blob:mock'
    })
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    const anchor = { href: '', download: '', click: vi.fn() }
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return anchor as unknown as HTMLElement
      return originalCreateElement(tag)
    })

    const appended: HTMLElement[] = []
    const removed: HTMLElement[] = []
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      appended.push(node as HTMLElement)
      return node
    })
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => {
      removed.push(node as HTMLElement)
      return node
    })

    downloadCsv('orders.csv', ['Item', 'Qty'], [
      ['Widget, XL', '2'],
      ['Said "hi"', '1'],
      ['Plain', '3'],
    ])

    expect(anchor.download).toBe('orders.csv')
    expect(anchor.href).toBe('blob:mock')
    expect(anchor.click).toHaveBeenCalledTimes(1)
    expect(appended).toEqual([anchor])
    expect(removed).toEqual([anchor])
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock')
    expect(capturedBlob).not.toBeNull()

    const buffer = new Uint8Array(await capturedBlob!.arrayBuffer())
    expect(Array.from(buffer.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf])
    const text = new TextDecoder('utf-8', { ignoreBOM: true }).decode(buffer)
    expect(text).toBe('\uFEFFItem,Qty\n"Widget, XL",2\n"Said ""hi""",1\nPlain,3')
  })

  it('leaves plain cells unquoted and wraps only cells needing quoting', async () => {
    let capturedBlob: Blob | null = null
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      capturedBlob = blob as Blob
      return 'blob:mock'
    })
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const anchor = { href: '', download: '', click: vi.fn() }
    vi.spyOn(document, 'createElement').mockImplementation(() => anchor as unknown as HTMLElement)
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node)
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node)

    downloadCsv('report.csv', ['Name', 'Qty'], [
      ['Line\nBreak', '4'],
      ['plain', '7'],
    ])

    const buffer = new Uint8Array(await capturedBlob!.arrayBuffer())
    expect(Array.from(buffer.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf])
    const text = new TextDecoder('utf-8', { ignoreBOM: true }).decode(buffer)
    expect(text).toBe('\uFEFFName,Qty\n"Line\nBreak",4\nplain,7')
  })
})
