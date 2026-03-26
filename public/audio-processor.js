// High-fidelity audio processor worklet for UltimoHub
// This worklet provides lossless audio capture with minimal latency

class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    if (!input || !input.length) return true;
    
    const channel = input[0];
    if (!channel) return true;

    // Copy input samples to our buffer
    for (let i = 0; i < channel.length; i++) {
      this.buffer[this.bufferIndex++] = channel[i];
      
      // When buffer is full, send it to the main thread
      if (this.bufferIndex >= this.bufferSize) {
        this.port.postMessage(this.buffer);
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
      }
    }
    
    // Always return true to keep the processor running
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
