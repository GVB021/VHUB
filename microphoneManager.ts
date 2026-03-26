const SAMPLE_RATE = 48000;
const FFT_SIZE = 2048;

export type VoiceCaptureMode = "studio" | "original" | "high-fidelity";

export interface MicrophoneState {
  stream: MediaStream;
  audioContext: AudioContext;
  sourceNode: MediaStreamAudioSourceNode;
  gainNode: GainNode;
  analyserNode: AnalyserNode;
  captureMode: VoiceCaptureMode;
  filterNodes: AudioNode[];
  deviceId: string | null;
  peakLevel: number;
  rmsLevel: number;
  isActive: boolean;
}

let currentState: MicrophoneState | null = null;

export async function requestMicrophone(
  mode: VoiceCaptureMode = "high-fidelity",
  deviceId: string | null = null
): Promise<MicrophoneState> {
  if (currentState && currentState.audioContext.state !== "closed") {
    if (currentState.captureMode === mode && currentState.deviceId === deviceId) {
      return currentState;
    }
  }

  const isStudio = mode === "studio";
  const isHighFidelity = mode === "high-fidelity";
  
  const constraints: MediaStreamConstraints = {
    audio: {
      sampleRate: { ideal: SAMPLE_RATE },
      channelCount: { ideal: 1, exact: 1 },
      echoCancellation: isStudio,
      noiseSuppression: isStudio,
      autoGainControl: false, // Manual control
      deviceId: deviceId ? { exact: deviceId } : undefined,
    },
  };

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    console.error("[MicManager] getUserMedia failed:", err);
    if (currentState && currentState.audioContext.state !== "closed") {
      console.log("[MicManager] Using existing mic state as fallback");
      return currentState;
    }
    throw err;
  }

  if (currentState && currentState.audioContext.state !== "closed") {
    await releaseMicrophone();
  }

  const audioContext = new AudioContext({ 
    sampleRate: SAMPLE_RATE,
    latencyHint: isHighFidelity ? 'playback' : 'interactive'
  });

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const sourceNode = audioContext.createMediaStreamSource(stream);
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 1.0;

  const analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = FFT_SIZE;
  analyserNode.smoothingTimeConstant = 0.8;
  analyserNode.minDecibels = -100;
  analyserNode.maxDecibels = -10;

  const filterNodes: AudioNode[] = [];

  // High-fidelity audio chain
  if (isHighFidelity || isStudio) {
    // High-pass filter to remove rumble
    const highPass = audioContext.createBiquadFilter();
    highPass.type = "highpass";
    highPass.frequency.value = 80;
    highPass.Q.value = 0.707;
    filterNodes.push(highPass);

    // De-esser for sibilance control
    const deesser = audioContext.createBiquadFilter();
    deesser.type = "peaking";
    deesser.frequency.value = 6500;
    deesser.Q.value = 2;
    deesser.gain.value = -6;
    filterNodes.push(deesser);

    // Multiband compressor for vocal control
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 15;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    filterNodes.push(compressor);

    // Connect chain
    sourceNode.connect(highPass);
    highPass.connect(deesser);
    deesser.connect(compressor);
    compressor.connect(gainNode);
  } else {
    sourceNode.connect(gainNode);
  }

  gainNode.connect(analyserNode);

  currentState = {
    stream,
    audioContext,
    sourceNode,
    gainNode,
    analyserNode,
    captureMode: mode,
    filterNodes,
    deviceId,
    peakLevel: 0,
    rmsLevel: 0,
    isActive: true,
  };

  // Start metering
  startMetering(currentState);
  
  console.log(`[MicManager] ${mode} mode active`, {
    sampleRate: audioContext.sampleRate,
    deviceId: deviceId || 'default',
    latencyHint: audioContext.baseLatency,
  });

  return currentState;
}

function startMetering(state: MicrophoneState) {
  const updateMeter = () => {
    if (!state.isActive) return;

    const bufferLength = state.analyserNode.frequencyBinCount;
    const data = new Uint8Array(bufferLength);
    
    state.analyserNode.getByteFrequencyData(data);
    
    // Calculate peak and RMS
    let peak = 0;
    let sum = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const value = data[i] / 255;
      sum += value * value;
      if (value > peak) peak = value;
    }
    
    state.peakLevel = peak;
    state.rmsLevel = Math.sqrt(sum / bufferLength);
    
    requestAnimationFrame(updateMeter);
  };
  
  updateMeter();
}

export function getFrequencyData(state: MicrophoneState): Uint8Array {
  const data = new Uint8Array(state.analyserNode.frequencyBinCount);
  state.analyserNode.getByteFrequencyData(data);
  return data;
}

export function getTimeDomainData(state: MicrophoneState): Uint8Array {
  const data = new Uint8Array(state.analyserNode.fftSize);
  state.analyserNode.getByteTimeDomainData(data);
  return data;
}

export function setGain(state: MicrophoneState, value: number): void {
  const clamped = Math.max(-12, Math.min(12, value));
  state.gainNode.gain.setTargetAtTime(
    Math.pow(10, clamped / 20),
    state.audioContext.currentTime,
    0.01
  );
}

export async function releaseMicrophone(): Promise<void> {
  if (!currentState) return;
  
  currentState.isActive = false;
  currentState.stream.getTracks().forEach(track => track.stop());
  
  if (currentState.audioContext.state !== "closed") {
    await currentState.audioContext.close();
  }
  
  currentState = null;
}

export function getMicState(): MicrophoneState | null {
  return currentState;
}

export async function listDevices(): Promise<MediaDeviceInfo[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter(device => device.kind === 'audioinput');
}
