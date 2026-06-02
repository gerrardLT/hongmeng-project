/**
 * 和风天气 JWT 认证工具
 * 使用 Ed25519 算法签名
 */

import nacl from 'tweetnacl'

// ============ polyfill（确保 UniApp 各平台可用） ============

/** TextEncoder polyfill */
const _TextEncoder: typeof TextEncoder =
  typeof TextEncoder !== 'undefined'
    ? TextEncoder
    : (class {
        encode(str: string): Uint8Array {
          const utf8: number[] = []
          for (let i = 0; i < str.length; i++) {
            let code = str.charCodeAt(i)
            if (code < 0x80) {
              utf8.push(code)
            } else if (code < 0x800) {
              utf8.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f))
            } else if (code >= 0xd800 && code <= 0xdbff) {
              const next = str.charCodeAt(++i)
              code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00)
              utf8.push(
                0xf0 | (code >> 18),
                0x80 | ((code >> 12) & 0x3f),
                0x80 | ((code >> 6) & 0x3f),
                0x80 | (code & 0x3f)
              )
            } else {
              utf8.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f))
            }
          }
          return new Uint8Array(utf8)
        }
      } as any)

/** btoa polyfill */
const _btoa: (str: string) => string =
  typeof btoa !== 'undefined'
    ? btoa
    : (str: string) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        let result = ''
        let i = 0
        while (i < str.length) {
          const a = str.charCodeAt(i++)
          const b = i < str.length ? str.charCodeAt(i++) : 0
          const c = i < str.length ? str.charCodeAt(i++) : 0
          const pad1 = i > str.length + 1
          const pad2 = i > str.length

          const n = (a << 16) | (b << 8) | c
          result += chars[(n >> 18) & 63]
          result += chars[(n >> 12) & 63]
          result += pad1 ? '=' : chars[(n >> 6) & 63]
          result += pad2 ? '=' : chars[n & 63]
        }
        return result
      }

/** atob polyfill */
const _atob: (str: string) => string =
  typeof atob !== 'undefined'
    ? atob
    : (str: string) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        let result = ''
        const cleaned = str.replace(/=+$/, '')
        for (let i = 0; i < cleaned.length; i += 4) {
          const a = chars.indexOf(cleaned[i])
          const b = chars.indexOf(cleaned[i + 1])
          const c = chars.indexOf(cleaned[i + 2])
          const d = chars.indexOf(cleaned[i + 3])
          const n = (a << 18) | (b << 12) | ((c >= 0 ? c : 0) << 6) | (d >= 0 ? d : 0)
          result += String.fromCharCode((n >> 16) & 255)
          if (c >= 0) result += String.fromCharCode((n >> 8) & 255)
          if (d >= 0) result += String.fromCharCode(n & 255)
        }
        return result
      }

// ============ JWT 核心实现 ============

/** Base64URL 编码（不是 Base64！区别在于 +→- /→_ 去掉=填充） */
function base64UrlEncode(data: Uint8Array | string): string {
  let bytes: Uint8Array
  if (typeof data === 'string') {
    bytes = new _TextEncoder().encode(data)
  } else {
    bytes = data
  }
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const base64 = _btoa(binary)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** 从 PEM 格式私钥提取原始 Ed25519 种子（32字节） */
function extractPrivateKeyFromPEM(pem: string): Uint8Array {
  const base64 = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '')

  const binary = _atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  // PKCS8 格式的 Ed25519 私钥：ASN.1 前缀(16字节) + 32字节种子
  const seed = bytes.slice(bytes.length - 32)
  return seed
}

/** 生成和风天气 JWT Token */
export function generateQWeatherJWT(
  credentialId: string,
  projectId: string,
  privateKeyPEM: string,
  expiresIn: number = 3600
): string {
  // Header
  const header = JSON.stringify({
    alg: 'EdDSA',
    kid: credentialId
  })

  // Payload
  const now = Math.floor(Date.now() / 1000)
  const payload = JSON.stringify({
    sub: projectId,
    iat: now - 30,
    exp: now + expiresIn
  })

  // Base64URL encode header and payload
  const headerEncoded = base64UrlEncode(header)
  const payloadEncoded = base64UrlEncode(payload)
  const data = headerEncoded + '.' + payloadEncoded

  // 从 PEM 提取种子并生成完整密钥对
  const seed = extractPrivateKeyFromPEM(privateKeyPEM)
  const keyPair = nacl.sign.keyPair.fromSeed(seed)

  // Ed25519 签名
  const dataBytes = new _TextEncoder().encode(data)
  const signature = nacl.sign.detached(dataBytes, keyPair.secretKey)

  // Base64URL encode signature
  const signatureEncoded = base64UrlEncode(signature)

  return data + '.' + signatureEncoded
}

// ============ JWT Token 缓存管理 ============

let cachedToken: string | null = null
let tokenExpiry: number = 0

/** 获取和风天气 JWT Token（自动缓存，有效期内复用） */
export function getQWeatherToken(
  credentialId: string,
  projectId: string,
  privateKeyPEM: string
): string {
  const now = Math.floor(Date.now() / 1000)
  // 如果 token 还有5分钟以上有效期，复用缓存
  if (cachedToken && tokenExpiry > now + 300) {
    return cachedToken
  }
  // 生成新 token，有效期1小时
  cachedToken = generateQWeatherJWT(credentialId, projectId, privateKeyPEM, 3600)
  tokenExpiry = now + 3600
  return cachedToken
}
