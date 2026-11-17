// Web Audio API Tactical Sound Synthesizer for NG911, Radio PTT, and BWC Audio
class TacticalAudioEngine {
  private ctx: AudioContext | null = null
  private activeNodes: (AudioNode | AudioBufferSourceNode | OscillatorNode)[] = []
  public isPlaying: boolean = false

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  // Play realistic tactical radio talk-permit chirp or release squelch
  public playPttChirp(type: 'grant' | 'release' | 'emergency' = 'grant'): void {
    try {
      const ctx = this.getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      const now = ctx.currentTime
      if (type === 'grant') {
        // Motorola ASTRO 25 / P25 trunking talk-permit chirp (three-tone quick burst)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(900, now)
        osc.frequency.setValueAtTime(1200, now + 0.05)
        osc.frequency.setValueAtTime(1500, now + 0.1)
        gain.gain.setValueAtTime(0.12, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
        osc.start(now)
        osc.stop(now + 0.22)
      } else if (type === 'release') {
        // PTT release squelch tail burst
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(500, now)
        osc.frequency.setValueAtTime(320, now + 0.04)
        gain.gain.setValueAtTime(0.08, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)
        osc.start(now)
        osc.stop(now + 0.09)
      } else if (type === 'emergency') {
        // High-low alert warble tone
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(1700, now)
        osc.frequency.setValueAtTime(1100, now + 0.15)
        gain.gain.setValueAtTime(0.15, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
        osc.start(now)
        osc.stop(now + 0.3)
      }
    } catch (e) {
      console.warn('Audio synthesis notice:', e)
    }
  }

  // Start continuous simulated 911 telephone / radio dispatch voice audio with realistic telephone bandpass filter
  public startPlayback(): void {
    this.stopPlayback()
    try {
      const ctx = this.getContext()
      const now = ctx.currentTime

      // 1. Radio channel background noise (filtered white noise)
      const bufferSize = ctx.sampleRate * 2
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }

      const whiteNoise = ctx.createBufferSource()
      whiteNoise.buffer = noiseBuffer
      whiteNoise.loop = true

      const bandpassFilter = ctx.createBiquadFilter()
      bandpassFilter.type = 'bandpass'
      bandpassFilter.frequency.value = 1100
      bandpassFilter.Q.value = 1.4

      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(0.015, now) // faint atmospheric carrier static

      whiteNoise.connect(bandpassFilter)
      bandpassFilter.connect(noiseGain)
      noiseGain.connect(ctx.destination)

      // 2. Dual formant oscillator simulating human speech cadence and inflections
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const voiceGain = ctx.createGain()

      osc1.type = 'sawtooth'
      osc2.type = 'triangle'
      osc1.frequency.setValueAtTime(220, now)
      osc2.frequency.setValueAtTime(440, now)

      // Speech cadence pitch modulation
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = 3.8 // speech rhythm syllables
      lfoGain.gain.value = 55
      lfo.connect(lfoGain)
      lfoGain.connect(osc1.frequency)

      const voiceFilter = ctx.createBiquadFilter()
      voiceFilter.type = 'bandpass'
      voiceFilter.frequency.value = 1250
      voiceFilter.Q.value = 2.2

      voiceGain.gain.setValueAtTime(0.05, now)

      osc1.connect(voiceFilter)
      osc2.connect(voiceFilter)
      voiceFilter.connect(voiceGain)
      voiceGain.connect(ctx.destination)

      whiteNoise.start(now)
      lfo.start(now)
      osc1.start(now)
      osc2.start(now)

      this.isPlaying = true
      this.activeNodes = [whiteNoise, lfo, osc1, osc2, noiseGain, voiceGain]
    } catch (e) {
      console.warn('Audio playback error:', e)
    }
  }

  public stopPlayback(): void {
    if (this.activeNodes.length > 0) {
      try {
        this.activeNodes.forEach((node) => {
          if ('stop' in node && typeof node.stop === 'function') {
            node.stop()
          }
          if ('disconnect' in node && typeof node.disconnect === 'function') {
            node.disconnect()
          }
        })
      } catch {
        // cleanup ignore
      }
      this.activeNodes = []
    }
    this.isPlaying = false
  }
}

export const tacticalAudio = new TacticalAudioEngine()
