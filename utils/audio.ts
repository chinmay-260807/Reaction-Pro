import { SoundPack } from '../types';

class AudioManager {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.5;
  private currentPack: SoundPack = SoundPack.CLASSIC;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public setVolume(value: number) {
    this.volume = value;
  }

  public setSoundPack(pack: SoundPack) {
    this.currentPack = pack;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number, endFreq?: number) {
    if (!this.isEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
    }

    // Apply master volume scaling
    const finalVolume = volume * this.volume;
    gain.gain.setValueAtTime(finalVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playTick() {
    switch (this.currentPack) {
      case SoundPack.ARCADE:
        this.playTone(1200, 'square', 0.03, 0.05);
        break;
      case SoundPack.TECH:
        this.playTone(2000, 'sine', 0.01, 0.08);
        break;
      default:
        this.playTone(800, 'sine', 0.05, 0.1);
    }
  }

  public playStart() {
    switch (this.currentPack) {
      case SoundPack.ARCADE:
        this.playTone(300, 'square', 0.3, 0.1, 600);
        break;
      case SoundPack.TECH:
        this.playTone(1000, 'sine', 0.1, 0.1, 1500);
        break;
      default:
        this.playTone(400, 'sine', 0.2, 0.2, 800);
    }
  }

  public playSuccess() {
    switch (this.currentPack) {
      case SoundPack.ARCADE:
        this.playTone(880, 'triangle', 0.4, 0.15, 1320);
        break;
      case SoundPack.TECH:
        this.playTone(1500, 'sine', 0.2, 0.12, 1800);
        break;
      default:
        this.playTone(880, 'sine', 0.3, 0.2, 440);
    }
  }

  public playError() {
    switch (this.currentPack) {
      case SoundPack.ARCADE:
        this.playTone(100, 'sawtooth', 0.3, 0.08, 50);
        break;
      case SoundPack.TECH:
        this.playTone(400, 'square', 0.1, 0.05, 200);
        break;
      default:
        this.playTone(150, 'square', 0.2, 0.1);
    }
  }
}

export const audioManager = new AudioManager();
