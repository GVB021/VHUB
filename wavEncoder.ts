/**
 * Constants for WAV encoding
 */
const SAMPLE_RATE = 48000;
const BIT_DEPTH = 24; // 24-bit for higher quality
const NUM_CHANNELS = 1; // Mono

/**
 * Encode audio samples as a WAV file
 * @param samples Float32Array of audio samples
 * @returns ArrayBuffer containing the WAV file data
 */
export function encodeWav(samples: Float32Array): ArrayBuffer {
  const bytesPerSample = BIT_DEPTH / 8;
  const dataLength = samples.length * bytesPerSample;
  const headerLength = 44; // Standard WAV header size
  const totalLength = headerLength + dataLength;

  // Create buffer for the entire WAV file
  const buffer = new ArrayBuffer(totalLength);
  const view = new DataView(buffer);

  // Write WAV header
  // "RIFF" chunk descriptor
  writeString(view, 0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, "WAVE");

  // "fmt " sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // Sub-chunk size (16 for PCM)
  view.setUint16(20, 1, true);  // Audio format (1 for PCM)
  view.setUint16(22, NUM_CHANNELS, true); // Number of channels
  view.setUint32(24, SAMPLE_RATE, true); // Sample rate
  view.setUint32(28, SAMPLE_RATE * NUM_CHANNELS * bytesPerSample, true); // Byte rate
  view.setUint16(32, NUM_CHANNELS * bytesPerSample, true); // Block align
  view.setUint16(34, BIT_DEPTH, true); // Bits per sample

  // "data" sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true); // Sub-chunk size

  // Write audio data
  let offset = headerLength;
  for (let i = 0; i < samples.length; i++) {
    // Clamp samples to [-1, 1] range
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    
    // Convert to integer value based on bit depth
    // For 24-bit audio, range is [-8388608, 8388607]
    const intVal = clamped < 0
      ? Math.round(clamped * 0x800000) // Negative values
      : Math.round(clamped * 0x7fffff); // Positive values

    // Write sample data (little-endian)
    view.setUint8(offset, intVal & 0xff);
    view.setUint8(offset + 1, (intVal >> 8) & 0xff);
    view.setUint8(offset + 2, (intVal >> 16) & 0xff);
    offset += 3;
  }

  return buffer;
}

/**
 * Helper function to write a string to a DataView
 */
function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Convert WAV buffer to a Blob for download or playback
 */
export function wavToBlob(wavBuffer: ArrayBuffer): Blob {
  return new Blob([wavBuffer], { type: "audio/wav" });
}

/**
 * Calculate duration in seconds from a samples array
 */
export function getDurationSeconds(samples: Float32Array): number {
  return samples.length / SAMPLE_RATE;
}

/**
 * Apply normalization to audio samples to optimize volume levels
 * @param samples Float32Array of audio samples
 * @param targetPeak Target peak level (0.0-1.0)
 * @returns Normalized Float32Array
 */
export function normalizeAudio(samples: Float32Array, targetPeak: number = 0.9): Float32Array {
  // Find the peak amplitude
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > peak) peak = abs;
  }
  
  // If the peak is too low or already at a good level, return the original
  if (peak < 0.01 || (peak >= targetPeak * 0.9 && peak <= targetPeak)) {
    return samples;
  }
  
  // Calculate the gain factor
  const gainFactor = targetPeak / peak;
  
  // Apply the gain
  const normalized = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    normalized[i] = samples[i] * gainFactor;
  }
  
  return normalized;
}

/**
 * Apply a simple noise gate to remove background noise
 * @param samples Float32Array of audio samples
 * @param threshold Noise threshold (0.0-1.0)
 * @returns Processed Float32Array
 */
export function applyNoiseGate(samples: Float32Array, threshold: number = 0.01): Float32Array {
  const processed = new Float32Array(samples.length);
  
  for (let i = 0; i < samples.length; i++) {
    if (Math.abs(samples[i]) < threshold) {
      processed[i] = 0;
    } else {
      processed[i] = samples[i];
    }
  }
  
  return processed;
}

/**
 * Apply a fade in/out to the audio to prevent clicks
 * @param samples Float32Array of audio samples
 * @param fadeInMs Fade in duration in milliseconds
 * @param fadeOutMs Fade out duration in milliseconds
 * @returns Processed Float32Array
 */
export function applyFades(
  samples: Float32Array, 
  fadeInMs: number = 10, 
  fadeOutMs: number = 50
): Float32Array {
  const fadeInSamples = Math.min(Math.floor(fadeInMs * SAMPLE_RATE / 1000), samples.length / 2);
  const fadeOutSamples = Math.min(Math.floor(fadeOutMs * SAMPLE_RATE / 1000), samples.length / 2);
  
  const processed = new Float32Array(samples);
  
  // Apply fade in
  for (let i = 0; i < fadeInSamples; i++) {
    const factor = i / fadeInSamples;
    processed[i] *= factor;
  }
  
  // Apply fade out
  for (let i = 0; i < fadeOutSamples; i++) {
    const factor = i / fadeOutSamples;
    processed[samples.length - 1 - i] *= factor;
  }
  
  return processed;
}
