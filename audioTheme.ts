/**
 * Web Audio API based athletic stadium theme generator.
 * Zero external audio assets required; runs reliably offline and on mobile.
 */

let audioCtx: AudioContext | null = null;
let isAudioRunning = false;
let masterGain: GainNode | null = null;
let timerId: number | null = null;

// Pentatonic triumphant athletic brass theme notes
const MELODY = [
  { freq: 261.63, dur: 0.25 }, // C4
  { freq: 329.63, dur: 0.25 }, // E4
  { freq: 392.00, dur: 0.25 }, // G4
  { freq: 523.25, dur: 0.50 }, // C5
  { freq: 440.00, dur: 0.25 }, // A4
  { freq: 392.00, dur: 0.25 }, // G4
  { freq: 523.25, dur: 0.75 }, // C5
  { freq: 0, dur: 0.25 },      // Rest
  { freq: 392.00, dur: 0.25 }, // G4
  { freq: 440.00, dur: 0.25 }, // A4
  { freq: 523.25, dur: 0.35 }, // C5
  { freq: 587.33, dur: 0.40 }, // D5
  { freq: 659.25, dur: 0.75 }, // E5
  { freq: 587.33, dur: 0.25 }, // D5
  { freq: 523.25, dur: 0.75 }, // C5
  { freq: 0, dur: 0.50 },      // Rest
];

export function isThemePlaying(): boolean {
  return isAudioRunning;
}

export function initAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setVolume(vol: number) {
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(Math.max(0, Math.min(vol, 0.4)), audioCtx.currentTime);
  }
}

function playNote(freq: number, duration: number, time: number) {
  if (!audioCtx || !masterGain || freq <= 0) return;

  // Brass/Fanfare lead oscillator
  const osc = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const noteGain = audioCtx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, time);

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * 0.5, time); // warm sub-octave

  // Attack-Decay envelope
  noteGain.gain.setValueAtTime(0, time);
  noteGain.gain.linearRampToValueAtTime(0.3, time + 0.05);
  noteGain.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.03);

  osc.connect(noteGain);
  osc2.connect(noteGain);
  noteGain.connect(masterGain);

  osc.start(time);
  osc2.start(time);
  osc.stop(time + duration);
  osc2.stop(time + duration);

  // Stadium percussion beat (kick/snare simulator)
  playKick(time);
}

function playKick(time: number) {
  if (!audioCtx || !masterGain) return;
  const kickOsc = audioCtx.createOscillator();
  const kickGain = audioCtx.createGain();

  kickOsc.frequency.setValueAtTime(120, time);
  kickOsc.frequency.exponentialRampToValueAtTime(30, time + 0.15);

  kickGain.gain.setValueAtTime(0.25, time);
  kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

  kickOsc.connect(kickGain);
  kickGain.connect(masterGain);

  kickOsc.start(time);
  kickOsc.stop(time + 0.2);
}

export function startThemeMusic(onStateChange?: (playing: boolean) => void): boolean {
  try {
    const ctx = initAudioContext();
    if (!ctx) return false;
    isAudioRunning = true;
    if (onStateChange) onStateChange(true);

    let noteIdx = 0;
    let nextNoteTime = ctx.currentTime + 0.1;

    function scheduleLoop() {
      if (!isAudioRunning || !audioCtx) return;

      while (nextNoteTime < audioCtx.currentTime + 0.8) {
        const item = MELODY[noteIdx % MELODY.length];
        if (item.freq > 0) {
          playNote(item.freq, item.dur, nextNoteTime);
        }
        nextNoteTime += item.dur;
        noteIdx++;
      }

      timerId = window.setTimeout(scheduleLoop, 200);
    }

    scheduleLoop();
    return true;
  } catch (err) {
    console.warn('Audio start prevented or not supported:', err);
    isAudioRunning = false;
    if (onStateChange) onStateChange(false);
    return false;
  }
}

export function stopThemeMusic(onStateChange?: (playing: boolean) => void) {
  isAudioRunning = false;
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
  if (onStateChange) onStateChange(false);
}

export function toggleThemeMusic(onStateChange?: (playing: boolean) => void): boolean {
  if (isAudioRunning) {
    stopThemeMusic(onStateChange);
    return false;
  } else {
    return startThemeMusic(onStateChange);
  }
}
