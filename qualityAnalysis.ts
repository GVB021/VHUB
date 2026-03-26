/**
 * Interface for audio quality metrics
 */
export interface QualityMetrics {
  score: number;          // Overall quality score (0-100)
  clipping: boolean;      // Whether clipping was detected
  loudness: number;       // RMS loudness level
  noiseFloor: number;     // Estimated noise floor level
  timingScore: number;    // Score for timing accuracy
  snr: number;            // Signal-to-noise ratio in dB
  clarity: number;        // Voice clarity score (0-1)
}

/**
 * Analyze the quality of a recorded audio take
 * @param samples Float32Array of audio samples
 * @param targetDuration Optional target duration for timing score
 * @returns Quality metrics object
 */
export function analyzeTakeQuality(
  samples: Float32Array, 
  targetDuration?: number
): QualityMetrics {
  if (samples.length === 0) {
    return { 
      score: 0, 
      clipping: false, 
      loudness: 0, 
      noiseFloor: 0, 
      timingScore: 0,
      snr: 0,
      clarity: 0
    };
  }

  // 1. Clipping detection
  let clippingCount = 0;
  const clippingThreshold = 0.98; // Slightly below 1.0 to catch near-clipping
  
  for (let i = 0; i < samples.length; i++) {
    if (Math.abs(samples[i]) >= clippingThreshold) {
      clippingCount++;
    }
  }
  
  const hasClipping = clippingCount > samples.length * 0.001; // More than 0.1% of samples clipping
  const clippingRatio = clippingCount / samples.length;

  // 2. Loudness (RMS)
  let sumSq = 0;
  for (let i = 0; i < samples.length; i++) {
    sumSq += samples[i] * samples[i];
  }
  const rms = Math.sqrt(sumSq / samples.length);
  
  // Normalize loudness score (ideal RMS around 0.15 - 0.2 for voice)
  const idealRms = 0.18;
  const loudnessScore = Math.max(0, 1 - Math.abs(rms - idealRms) * 4);

  // 3. Noise Floor (estimate from quietest 100ms window)
  const windowSize = 4800; // 100ms at 48kHz
  let minWindowRms = Infinity;
  
  for (let i = 0; i < samples.length - windowSize; i += windowSize / 2) { // 50% overlap
    let windowSumSq = 0;
    for (let j = 0; j < windowSize; j++) {
      const s = samples[i + j];
      windowSumSq += s * s;
    }
    const windowRms = Math.sqrt(windowSumSq / windowSize);
    if (windowRms < minWindowRms) minWindowRms = windowRms;
  }
  
  // Noise floor score: lower is better. -60dB is ~0.001.
  const noiseScore = Math.max(0, 1 - minWindowRms * 50);

  // 4. Signal-to-Noise Ratio (SNR)
  const signalPower = rms * rms;
  const noisePower = minWindowRms * minWindowRms;
  const snr = noisePower > 0 ? 10 * Math.log10(signalPower / noisePower) : 100;
  const snrScore = Math.min(1, Math.max(0, snr / 40)); // 40dB is excellent

  // 5. Voice Clarity (frequency distribution analysis)
  // This is a simplified approximation - real clarity would need spectral analysis
  const clarityScore = Math.max(0, Math.min(1, 
    (loudnessScore * 0.4) + 
    (noiseScore * 0.4) + 
    (snrScore * 0.2)
  ));

  // 6. Timing Score
  let timingScore = 1.0;
  if (targetDuration && targetDuration > 0) {
    const duration = samples.length / 48000;
    const diff = Math.abs(duration - targetDuration);
    timingScore = Math.max(0, 1 - diff / targetDuration);
  }

  // 7. Overall Score (0-100)
  let baseScore = (
    loudnessScore * 0.35 + 
    noiseScore * 0.25 + 
    snrScore * 0.2 + 
    clarityScore * 0.1 + 
    timingScore * 0.1
  ) * 100;
  
  // Apply penalties
  if (hasClipping) {
    // Progressive penalty based on amount of clipping
    const clippingPenalty = Math.min(0.5, clippingRatio * 10);
    baseScore *= (1 - clippingPenalty);
  }
  
  if (rms < 0.05) {
    // Penalty for very quiet recordings
    baseScore *= 0.8;
  }

  return {
    score: Math.round(Math.max(0, Math.min(100, baseScore))),
    clipping: hasClipping,
    loudness: rms,
    noiseFloor: minWindowRms,
    timingScore,
    snr,
    clarity: clarityScore
  };
}

/**
 * Get a human-readable quality assessment
 * @param metrics Quality metrics object
 * @returns Object with assessment text and suggestions
 */
export function getQualityAssessment(metrics: QualityMetrics): {
  assessment: string;
  suggestions: string[];
} {
  const suggestions: string[] = [];
  let assessment = "";

  if (metrics.score >= 90) {
    assessment = "Excelente qualidade de áudio";
  } else if (metrics.score >= 75) {
    assessment = "Boa qualidade de áudio";
  } else if (metrics.score >= 60) {
    assessment = "Qualidade de áudio aceitável";
  } else if (metrics.score >= 40) {
    assessment = "Qualidade de áudio abaixo do ideal";
  } else {
    assessment = "Qualidade de áudio insatisfatória";
  }

  // Add specific suggestions based on detected issues
  if (metrics.clipping) {
    suggestions.push("Reduzir o volume do microfone para evitar distorção");
  }
  
  if (metrics.loudness < 0.1) {
    suggestions.push("Aumentar o volume do microfone ou falar mais próximo dele");
  } else if (metrics.loudness > 0.3) {
    suggestions.push("Reduzir o volume do microfone ou afastar-se um pouco");
  }
  
  if (metrics.noiseFloor > 0.01) {
    suggestions.push("Reduzir ruído de fundo ou usar modo 'studio' de gravação");
  }
  
  if (metrics.snr < 20) {
    suggestions.push("Melhorar a relação sinal-ruído (ambiente mais silencioso)");
  }
  
  if (metrics.timingScore < 0.7) {
    suggestions.push("Melhorar a sincronização com o vídeo");
  }

  return { assessment, suggestions };
}
