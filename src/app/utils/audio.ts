let audioCtx: AudioContext | null = null;

export function playTick() {
  if (!audioCtx) audioCtx = new AudioContext();
  const t = audioCtx.currentTime;

  // Cloth flip — soft fabric unfurl
  const dur = 0.26;
  const bufferLen = Math.floor(audioCtx.sampleRate * dur);
  const buffer = audioCtx.createBuffer(1, bufferLen, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferLen; i++) data[i] = Math.random() * 2 - 1;

  // Layer 1: muffled "fwup" — the initial flip
  const n1 = audioCtx.createBufferSource();
  n1.buffer = buffer;
  const lp1 = audioCtx.createBiquadFilter();
  lp1.type = 'lowpass';
  lp1.frequency.setValueAtTime(2400, t);
  lp1.frequency.exponentialRampToValueAtTime(500, t + 0.08);
  lp1.Q.value = 0.6;
  const g1 = audioCtx.createGain();
  g1.gain.setValueAtTime(0.002, t);
  g1.gain.linearRampToValueAtTime(0.004, t + 0.015);
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  n1.connect(lp1); lp1.connect(g1); g1.connect(audioCtx.destination);
  n1.start(t); n1.stop(t + 0.12);

  // Layer 2: fabric rustle — mid-band texture
  const n2 = audioCtx.createBufferSource();
  n2.buffer = buffer;
  const bp = audioCtx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(1800, t + 0.01);
  bp.frequency.exponentialRampToValueAtTime(700, t + 0.18);
  bp.Q.value = 0.5;
  const g2 = audioCtx.createGain();
  g2.gain.setValueAtTime(0.001, t);
  g2.gain.linearRampToValueAtTime(0.0025, t + 0.04);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  n2.connect(bp); bp.connect(g2); g2.connect(audioCtx.destination);
  n2.start(t); n2.stop(t + 0.24);

  // Layer 3: soft air displacement — cloth pushing air
  const n3 = audioCtx.createBufferSource();
  n3.buffer = buffer;
  const lp2 = audioCtx.createBiquadFilter();
  lp2.type = 'lowpass';
  lp2.frequency.setValueAtTime(800, t + 0.02);
  lp2.frequency.exponentialRampToValueAtTime(200, t + 0.2);
  lp2.Q.value = 0.2;
  const g3 = audioCtx.createGain();
  g3.gain.setValueAtTime(0.001, t);
  g3.gain.linearRampToValueAtTime(0.0025, t + 0.05);
  g3.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
  n3.connect(lp2); lp2.connect(g3); g3.connect(audioCtx.destination);
  n3.start(t); n3.stop(t + dur);
}

export function playWhoosh() {
  if (!audioCtx) audioCtx = new AudioContext();
  const t = audioCtx.currentTime;
  const dur = 1.5;
  const bufferLen = Math.floor(audioCtx.sampleRate * dur);
  const buffer = audioCtx.createBuffer(1, bufferLen, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferLen; i++) data[i] = Math.random() * 2 - 1;

  const src = audioCtx.createBufferSource();
  src.buffer = buffer;

  // Bandpass sweep: low → high → low = whoosh past
  const bp = audioCtx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 1.0;
  bp.frequency.setValueAtTime(200, t);
  bp.frequency.exponentialRampToValueAtTime(4000, t + 0.5);
  bp.frequency.exponentialRampToValueAtTime(200, t + dur);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.001, t);
  gain.gain.linearRampToValueAtTime(0.006, t + 0.25);
  gain.gain.setValueAtTime(0.006, t + 0.7);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

  src.connect(bp);
  bp.connect(gain);
  gain.connect(audioCtx.destination);
  src.start(t);
  src.stop(t + dur);
}
