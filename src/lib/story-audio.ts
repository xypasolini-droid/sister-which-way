/** Optional local sounds. The audio context is created only after a player gesture. */
export type StorySoundCue = 'scissors' | 'knock' | 'steps' | 'wind' | 'rumble' | 'bell';
export function createStoryAudio() {
  let context: AudioContext | undefined;
  let enabled = false;
  let disposed = false;
  const sources = new Set<AudioScheduledSourceNode>();
  function stop() {
    for (const source of sources) { try { source.stop(); } catch { /* Already ended. */ } source.disconnect(); }
    sources.clear();
  }
  async function setEnabled(value: boolean): Promise<boolean> {
    if (disposed) return false;
    enabled = false;
    if (!value) { stop(); return false; }
    try {
      if (!context) {
        if (typeof window === 'undefined') return false;
        const Audio = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Audio) return false;
        context = new Audio();
      }
      if (context.state === 'suspended') await context.resume();
      enabled = !disposed && context.state === 'running';
    } catch { enabled = false; }
    return enabled;
  }
  function play(cue: StorySoundCue) {
    if (!enabled || disposed || !context || context.state !== 'running') return;
    stop();
    const audio = context;
    const now = audio.currentTime;
    function tone(frequency: number, duration: number, volume: number, offset = 0) {
      const source = audio.createOscillator();
      const gain = audio.createGain();
      source.type = 'sine'; source.frequency.value = frequency;
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(volume, now + offset + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + duration);
      source.connect(gain); gain.connect(audio.destination); sources.add(source);
      source.onended = () => { sources.delete(source); source.disconnect(); gain.disconnect(); };
      source.start(now + offset); source.stop(now + offset + duration);
    }
    function noise(duration: number, volume: number, cutoff: number, offset = 0) {
      const source = audio.createBufferSource();
      const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * duration), audio.sampleRate);
      const samples = buffer.getChannelData(0);
      let seed = 17;
      for (let i = 0; i < samples.length; i++) { seed = (seed * 16807) % 2147483647; samples[i] = (seed / 2147483647) * 2 - 1; }
      source.buffer = buffer;
      const filter = audio.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = cutoff;
      const gain = audio.createGain();
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(volume, now + offset + Math.min(0.08, duration / 4));
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + duration);
      source.connect(filter); filter.connect(gain); gain.connect(audio.destination); sources.add(source);
      source.onended = () => { sources.delete(source); source.disconnect(); filter.disconnect(); gain.disconnect(); };
      source.start(now + offset); source.stop(now + offset + duration);
    }
    try {
      if (cue === 'scissors') { noise(0.13, 0.06, 3600); noise(0.13, 0.045, 2800, 0.24); }
      else if (cue === 'knock') { tone(95, 0.14, 0.09); tone(95, 0.14, 0.08, 0.26); }
      else if (cue === 'steps') { noise(0.16, 0.065, 450); noise(0.16, 0.05, 450, 0.38); }
      else if (cue === 'wind') noise(2.4, 0.045, 700);
      else if (cue === 'rumble') { noise(1.8, 0.06, 150); tone(46, 1.2, 0.035); }
      else { tone(440, 1.4, 0.035); tone(660, 1.1, 0.018, 0.1); }
    } catch { stop(); enabled = false; }
  }
  function dispose() { disposed = true; enabled = false; stop(); if (context) { void context.close().catch(() => undefined); context = undefined; } }
  return { setEnabled, play, stop, dispose };
}
