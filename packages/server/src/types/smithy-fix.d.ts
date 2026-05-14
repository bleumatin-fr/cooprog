// Fix for @smithy/core TypeScript compatibility issue
// This overrides the problematic Uint8Array type definition

declare global {
  // Override the Uint8Array type to be compatible with older @smithy/core versions
  interface Uint8Array {
    // This makes Uint8Array compatible with the generic usage in @smithy/core
  }
}

// Re-export everything from @smithy/core to avoid import issues
declare module "@smithy/core" {
  export * from "@smithy/core/dist-types/index";
}
