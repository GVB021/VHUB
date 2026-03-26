import type { MicrophoneState } from "./microphoneManager";

const BUFFER_SIZE = 4096;

export type RecordingStatus =
  | "idle"
  | "countdown"
  | "recording"
  | "recorded"
  | "previewing";

export interface RecordingResult {
  samples: Float32Array;
  durationSeconds: number;
  sampleRate: number;
}

// Module-level variables
let workletNode: AudioWorkletNode | null = null;
let scriptProcessorNode: ScriptProcessorNode | null = null;
let recordedChunks: Float32Array[] = [];
let totalSamples = 0;
let isCapturing = false;
let captureStartTime = 0;

/**
 * Start capturing audio from the microphone
 * @param micState The current microphone state
 */
export function startCapture(micState: MicrophoneState): void {
  // Reset state
  recordedChunks = [];
  totalSamples = 0;
  isCapturing = true;
  captureStartTime = Date.now();
  
  console.info("[AudioPipeline][Capture] Starting capture", {
    captureMode: micState.captureMode,
    contextState: micState.audioContext.state,
    sampleRate: micState.audioContext.sampleRate,
  });

  // Make sure the audio context is running
  if (micState.audioContext.state === "suspended") {
    micState.audioContext.resume().then(() => {
      console.log("[AudioPipeline][Capture] AudioContext resumed before capture");
    });
  }

  // Clean up any existing nodes
  cleanupNodes(micState);

  // Use AudioWorklet if in high-fidelity mode and module is loaded
  if (micState.captureMode === "high-fidelity") {
    try {
      workletNode = new AudioWorkletNode(micState.audioContext, "audio-processor");
      workletNode.port.onmessage = (event) => {
        if (!isCapturing) return; // Ignore messages after stopping
        
        const input = event.data; // Float32Array
        const copy = new Float32Array(input.length);
        copy.set(input);
        recordedChunks.push(copy);
        totalSamples += copy.length;
      };
      
      micState.gainNode.connect(workletNode);
      workletNode.connect(micState.audioContext.destination); // Keep alive
      console.info("[AudioPipeline][Capture] Using AudioWorklet for high-fidelity capture");
      return;
    } catch (e) {
      console.warn("[AudioPipeline][Capture] AudioWorklet failed, falling back to ScriptProcessor", e);
    }
  }

  // Fallback / Standard capture using ScriptProcessor
  try {
    scriptProcessorNode = micState.audioContext.createScriptProcessor(
      BUFFER_SIZE,
      1,
      1
    );

    scriptProcessorNode.onaudioprocess = (event) => {
      if (!isCapturing) return; // Ignore events after stopping
      
      const input = event.inputBuffer.getChannelData(0);
      const copy = new Float32Array(input.length);
      copy.set(input);
      recordedChunks.push(copy);
      totalSamples += copy.length;
    };

    micState.gainNode.connect(scriptProcessorNode);
    scriptProcessorNode.connect(micState.audioContext.destination);
    console.info("[AudioPipeline][Capture] Using ScriptProcessor", {
      sampleRate: micState.audioContext.sampleRate,
      bufferSize: BUFFER_SIZE,
    });
  } catch (e) {
    console.error("[AudioPipeline][Capture] Failed to create ScriptProcessor", e);
    throw e;
  }
}

/**
 * Stop capturing audio and return the recorded samples
 * @param micState The current microphone state
 * @returns The recorded audio data
 */
export function stopCapture(micState: MicrophoneState): RecordingResult {
  const captureDuration = (Date.now() - captureStartTime) / 1000;
  
  console.info("[AudioPipeline][Capture] Stopping capture", {
    chunksCount: recordedChunks.length,
    totalSamples,
    durationMs: Date.now() - captureStartTime,
  });

  isCapturing = false;
  
  // Clean up nodes
  cleanupNodes(micState);

  // Combine all chunks into a single Float32Array
  const samples = new Float32Array(totalSamples);
  let offset = 0;
  for (const chunk of recordedChunks) {
    samples.set(chunk, offset);
    offset += chunk.length;
  }
  
  // Clear memory
  recordedChunks = [];
  totalSamples = 0;

  const sampleRate = micState.audioContext.sampleRate || 48000;
  const durationSeconds = samples.length / sampleRate;
  
  console.info("[AudioPipeline][Capture] Capture completed", {
    samplesLength: samples.length,
    durationSeconds,
    sampleRate,
    expectedDuration: captureDuration,
    driftMs: Math.abs(durationSeconds - captureDuration) * 1000,
  });

  return { samples, durationSeconds, sampleRate };
}

/**
 * Clean up audio nodes used for recording
 */
function cleanupNodes(micState: MicrophoneState): void {
  // Clean up worklet node
  if (workletNode) {
    try {
      micState.gainNode.disconnect(workletNode);
      workletNode.disconnect();
    } catch (e) {
      console.warn("[AudioPipeline][Capture] Error disconnecting worklet", e);
    }
    workletNode = null;
  }

  // Clean up script processor node
  if (scriptProcessorNode) {
    try {
      micState.gainNode.disconnect(scriptProcessorNode);
      scriptProcessorNode.disconnect();
    } catch (e) {
      console.warn("[AudioPipeline][Capture] Error disconnecting script processor", e);
    }
    scriptProcessorNode = null;
  }
}

/**
 * Create a URL for previewing a WAV blob
 */
export function createPreviewUrl(wavBlob: Blob): string {
  return URL.createObjectURL(wavBlob);
}

/**
 * Revoke a preview URL to free memory
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Play a countdown beep sound
 */
export function playCountdownBeep(
  audioContext: AudioContext,
  frequency: number = 880,
  duration: number = 0.12
): void {
  const osc = audioContext.createOscillator();
  const env = audioContext.createGain();
  
  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  env.gain.setValueAtTime(0.3, audioContext.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  
  osc.connect(env);
  env.connect(audioContext.destination);
  
  osc.start();
  osc.stop(audioContext.currentTime + duration);
}

/**
 * Cancel any ongoing recording and clean up resources
 */
export function cancelCapture(micState: MicrophoneState): void {
  if (!isCapturing) return;
  
  console.info("[AudioPipeline][Capture] Cancelling capture");
  
  isCapturing = false;
  recordedChunks = [];
  totalSamples = 0;
  
  cleanupNodes(micState);
}
