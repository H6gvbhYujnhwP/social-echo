declare module 'qrcode' {
  // Minimal typed surface we use
  export function toDataURL(
    text: string,
    options?: unknown
  ): Promise<string>;

  export function toString(
    text: string,
    options?: unknown
  ): Promise<string>;
}

