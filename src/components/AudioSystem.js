import { Howl, Howler } from 'howler';

// Master Volume Configuration
Howler.volume(0.8);

const AVAILABLE_BGM_TRACKS = new Set([
      '/assets/audio/Rio_do_Futuro.mp4',
]);

export const AmbientAudioEngine = {
      drone: null,
      bgm: null,
      activeTimeouts: [],
      
      init() {
            // Howler initializes itself automatically.
      },

      stopAll() {
            this.activeTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
            this.activeTimeouts = [];
            if (this.drone) {
                  this.drone.stop();
                  this.drone.unload();
                  this.drone = null;
            }
            if (this.bgm) {
                  this.bgm.stop();
                  this.bgm.unload();
                  this.bgm = null;
            }
      },

      setVolume(val) {
            Howler.volume(val);
      },

      // --- ADVANCED AMBIENT SFX ---
      playCyberpunkDrone() {
            this.stopAll();
            // A complex synthesized drone played via Web Audio mathematically
            // This generates a deep bass and eerie pad using Howler's audio context
            if (!Howler.ctx) return;
            const ctx = Howler.ctx;
            const masterGain = ctx.createGain();
            masterGain.gain.value = 0.25;
            masterGain.connect(Howler.masterGain);

            const nodes = [];
            const bass = ctx.createOscillator();
            const bassGain = ctx.createGain();
            bass.type = 'triangle'; bass.frequency.value = 40;
            bassGain.gain.value = 0.3;
            bass.connect(bassGain); bassGain.connect(masterGain);
            bass.start(); nodes.push({ osc: bass, gain: bassGain });

            const pad = ctx.createOscillator();
            const padGain = ctx.createGain();
            pad.type = 'sine'; pad.frequency.value = 110;
            pad.detune.value = -15;
            padGain.gain.value = 0.1;
            pad.connect(padGain); padGain.connect(masterGain);
            pad.start(); nodes.push({ osc: pad, gain: padGain });

            this.drone = {
                  stop: () => {
                        try {
                              nodes.forEach(n => { n.osc.stop(); n.osc.disconnect(); n.gain.disconnect(); });
                              masterGain.disconnect();
                        } catch(e) {}
                  },
                  unload: () => {}
            };
      },

      playTensionDrone() {
            this.stopAll();
            if (!Howler.ctx) return;
            const ctx = Howler.ctx;
            const masterGain = ctx.createGain();
            masterGain.gain.value = 0.25;
            masterGain.connect(Howler.masterGain);

            const nodes = [];
            const o1 = ctx.createOscillator();
            const g1 = ctx.createGain();
            o1.type = 'sawtooth'; o1.frequency.value = 55;
            g1.gain.value = 0.12;
            o1.connect(g1); g1.connect(masterGain);
            o1.start(); nodes.push({ osc: o1, gain: g1 });

            // Dissonant second
            const o2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            o2.type = 'square'; o2.frequency.value = 58.27; // Minor 2nd
            g2.gain.value = 0.06;
            o2.connect(g2); g2.connect(masterGain);
            o2.start(); nodes.push({ osc: o2, gain: g2 });

            this.drone = {
                  stop: () => {
                        try {
                              nodes.forEach(n => { n.osc.stop(); n.osc.disconnect(); n.gain.disconnect(); });
                              masterGain.disconnect();
                        } catch(e) {}
                  },
                  unload: () => {}
            };
      },

      playCleanDrone() {
            this.stopAll();
            if (!Howler.ctx) return;
            const ctx = Howler.ctx;
            const masterGain = ctx.createGain();
            masterGain.gain.value = 0.2;
            masterGain.connect(Howler.masterGain);

            const nodes = [];
            const o1 = ctx.createOscillator();
            const g1 = ctx.createGain();
            o1.type = 'sine'; o1.frequency.value = 220;
            g1.gain.value = 0.08;
            o1.connect(g1); g1.connect(masterGain);
            o1.start(); nodes.push({ osc: o1, gain: g1 });

            const o2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            o2.type = 'sine'; o2.frequency.value = 330;
            g2.gain.value = 0.05;
            o2.connect(g2); g2.connect(masterGain);
            o2.start(); nodes.push({ osc: o2, gain: g2 });

            this.drone = {
                  stop: () => {
                        try {
                              nodes.forEach(n => { n.osc.stop(); n.osc.disconnect(); n.gain.disconnect(); });
                              masterGain.disconnect();
                        } catch(e) {}
                  },
                  unload: () => {}
            };
      },

      // --- UI AND SFX (SPATIAL READY) ---
      playHover() {
            if (!Howler.ctx) return;
            const ctx = Howler.ctx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.connect(gain); gain.connect(Howler.masterGain);
            osc.start(); osc.stop(ctx.currentTime + 0.1);
      },

      playClick() {
            if (!Howler.ctx) return;
            const ctx = Howler.ctx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.connect(gain); gain.connect(Howler.masterGain);
            osc.start(); osc.stop(ctx.currentTime + 0.1);
      },

      playGlitch() {
            if (!Howler.ctx) return;
            const ctx = Howler.ctx;
            for (let i = 0; i < 4; i++) {
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.type = 'sawtooth';
                  osc.frequency.value = 100 + Math.random() * 800;
                  gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
                  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.06);
                  osc.connect(gain); gain.connect(Howler.masterGain);
                  osc.start(ctx.currentTime + i * 0.08);
                  osc.stop(ctx.currentTime + i * 0.08 + 0.06);
            }
      },

      playSuccess() {
            if (!Howler.ctx) return;
            const ctx = Howler.ctx;
            const notes = [440, 554.37, 659.25];

            notes.forEach((frequency, index) => {
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  const startTime = ctx.currentTime + index * 0.08;

                  osc.type = 'triangle';
                  osc.frequency.setValueAtTime(frequency, startTime);
                  gain.gain.setValueAtTime(0.001, startTime);
                  gain.gain.exponentialRampToValueAtTime(0.09, startTime + 0.02);
                  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.24);

                  osc.connect(gain);
                  gain.connect(Howler.masterGain);
                  osc.start(startTime);
                  osc.stop(startTime + 0.24);
            });
      },

      playAlarm() {
            if (!Howler.ctx) return;
            const ctx = Howler.ctx;

            for (let index = 0; index < 2; index += 1) {
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  const startTime = ctx.currentTime + index * 0.18;

                  osc.type = 'square';
                  osc.frequency.setValueAtTime(index % 2 === 0 ? 880 : 660, startTime);
                  gain.gain.setValueAtTime(0.001, startTime);
                  gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.01);
                  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);

                  osc.connect(gain);
                  gain.connect(Howler.masterGain);
                  osc.start(startTime);
                  osc.stop(startTime + 0.16);
            }
      },

      playPrint() {
            if (!Howler.ctx) return;
            const ctx = Howler.ctx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(1200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(Howler.masterGain);
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
      },

      playDoor() {
            if (!Howler.ctx) return;
            const ctx = Howler.ctx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.22);
            gain.gain.setValueAtTime(0.07, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

            osc.connect(gain);
            gain.connect(Howler.masterGain);
            osc.start();
            osc.stop(ctx.currentTime + 0.22);
      },

      playSceneEffect(effectKey) {
            switch (effectKey) {
                  case 'sfx_alarm':
                        this.playAlarm();
                        break;
                  case 'sfx_glitch':
                  case 'sfx_funk':
                        this.playGlitch();
                        break;
                  case 'sfx_print':
                  case 'sfx_print_success':
                        this.playPrint();
                        this.activeTimeouts.push(setTimeout(() => this.playSuccess(), 120));
                        break;
                  case 'sfx_success':
                        this.playSuccess();
                        break;
                  case 'sfx_door':
                  case 'sfx_doors_opening':
                        this.playDoor();
                        break;
                  default:
                        break;
            }
      },

      // --- BGM TRACK LOOPING ---
      playBGM(url) {
            const resolvedUrl = AVAILABLE_BGM_TRACKS.has(url) ? url : null;

            if (this.bgm) {
                  this.bgm.stop();
                  this.bgm.unload();
                  this.bgm = null;
            }

            // Scenes without a shipped music asset fall back to the synthesized ambient layers.
            if (!resolvedUrl) {
                  return;
            }

            this.bgm = new Howl({
                  src: [resolvedUrl],
                  loop: true,
                  volume: 0.4,
                  html5: false, // Force Web Audio API for perfect seamless looping
                  preload: true
            });
            this.bgm.play();
      }
};
