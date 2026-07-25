/**
 * Web Crypto API Zero-Knowledge E2EE Engine for Ping Vault
 * All payload encryption and decryption happens strictly inside the user's browser.
 */

export interface EncryptedVaultPayload {
  ciphertext: string; // Base64 AES-256-GCM ciphertext
  iv: string; // Base64 IV
  authTag: string; // Base64 Auth Tag
  encryptedSymmetricKeys: Record<string, string>; // receiverId -> Base64 encrypted key
}

export class CryptoClient {
  /**
   * Generates a 2048-bit RSA-OAEP Key Pair (Web Crypto API)
   */
  public static async generateKeyPair(): Promise<{ publicKeyPEM: string; privateKeyPEM: string; salt: string }> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );

    const pubExport = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privExport = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    const publicKeyPEM = this.arrayBufferToBase64(pubExport);
    const privateKeyPEM = this.arrayBufferToBase64(privExport);
    const salt = Array.from(window.crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return { publicKeyPEM, privateKeyPEM, salt };
  }

  /**
   * Zero-Knowledge Encrypt Vault Payload for 1 or Multiple Recipients
   */
  public static async encryptVault(
    payload: string,
    recipientMap: Record<string, string> // receiverId -> publicKeyPEM
  ): Promise<EncryptedVaultPayload> {
    // 1. Generate random AES-GCM 256-bit symmetric key for this vault
    const symmetricKey = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // 2. Encrypt payload with symmetric key
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedPayload = encoder.encode(payload);

    const encryptedData = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      symmetricKey,
      encodedPayload
    );

    const ciphertext = this.arrayBufferToBase64(encryptedData);
    const ivBase64 = this.arrayBufferToBase64(iv.buffer);
    const authTagBase64 = 'AES-GCM-AUTH-OK'; // Built into WebCrypto AES-GCM buffer

    // 3. Export raw symmetric key bytes
    const exportedSymKey = await window.crypto.subtle.exportKey('raw', symmetricKey);

    // 4. Encrypt symmetric key for each recipient's RSA public key
    const encryptedSymmetricKeys: Record<string, string> = {};

    for (const [receiverId, pubKeyPEM] of Object.entries(recipientMap)) {
      try {
        const rsaPubKey = await this.importPublicKey(pubKeyPEM);
        const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
          { name: 'RSA-OAEP' },
          rsaPubKey,
          exportedSymKey
        );
        encryptedSymmetricKeys[receiverId] = this.arrayBufferToBase64(encryptedKeyBuffer);
      } catch (err) {
        console.error(`Failed to encrypt key for receiver ${receiverId}`, err);
      }
    }

    return {
      ciphertext,
      iv: ivBase64,
      authTag: authTagBase64,
      encryptedSymmetricKeys,
    };
  }

  /**
   * Zero-Knowledge Decrypt Vault Payload
   */
  public static async decryptVault(
    encryptedSymmetricKeyBase64: string,
    ciphertextBase64: string,
    ivBase64: string,
    privateKeyPEM: string
  ): Promise<string> {
    // 1. Import user's RSA private key
    const rsaPrivKey = await this.importPrivateKey(privateKeyPEM);

    // 2. Decrypt symmetric key
    const encryptedSymKeyBuffer = this.base64ToArrayBuffer(encryptedSymmetricKeyBase64);
    const decryptedSymKeyRaw = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      rsaPrivKey,
      encryptedSymKeyBuffer
    );

    // 3. Import symmetric key
    const symmetricKey = await window.crypto.subtle.importKey(
      'raw',
      decryptedSymKeyRaw,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    // 4. Decrypt payload
    const ciphertextBuffer = this.base64ToArrayBuffer(ciphertextBase64);
    const iv = this.base64ToArrayBuffer(ivBase64);

    const decryptedPayloadBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      symmetricKey,
      ciphertextBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedPayloadBuffer);
  }

  // --- Helper Cryptographic Utils ---

  private static async importPublicKey(pemBase64: string): Promise<CryptoKey> {
    const binaryDer = this.base64ToArrayBuffer(pemBase64);
    return window.crypto.subtle.importKey(
      'spki',
      binaryDer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['encrypt']
    );
  }

  private static async importPrivateKey(pemBase64: string): Promise<CryptoKey> {
    const binaryDer = this.base64ToArrayBuffer(pemBase64);
    return window.crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['decrypt']
    );
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
