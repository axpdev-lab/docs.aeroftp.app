# AeroPlayer

AeroPlayer is AeroFTP's built-in audio player, designed for previewing audio files directly within the file manager. It uses native HTML5 `<audio>` with a Web Audio API processing graph for real-time audio manipulation and visualization.

## Audio Engine

AeroPlayer replaced the Howler.js library with a direct HTML5 Audio + Web Audio API architecture. Audio is routed through a processing graph:

```
Audio Source → 10-Band EQ → Stereo Panner → Analyser → Destination
```

A prebuffer strategy (6 seconds minimum) ensures smooth playback start.

## 10-Band Equalizer

Each band uses a Web Audio `BiquadFilterNode` for precise frequency control:

| Band | Frequency |
|------|-----------|
| 1 | 32 Hz |
| 2 | 64 Hz |
| 3 | 125 Hz |
| 4 | 250 Hz |
| 5 | 500 Hz |
| 6 | 1 kHz |
| 7 | 2 kHz |
| 8 | 4 kHz |
| 9 | 8 kHz |
| 10 | 16 kHz |

Ten built-in presets are available (Flat, Bass Boost, Treble Boost, Vocal, etc.). A `StereoPannerNode` provides left/right balance control.

## Visualizer Modes

AeroPlayer offers 14 visualization modes, cycled with the **V** key:

### Canvas 2D (8 modes)
Standard 2D visualizations including waveform, frequency bars, circular spectrum, and oscilloscope variants.

### WebGL 2 (6 modes)
GPU-accelerated shader-based visualizations:

| Shader | Description |
|--------|-------------|
| Wave Glitch | Distorted waveform with glitch artifacts |
| VHS | Retro VHS tape effect with scanlines |
| Mandelbrot | Fractal zoom driven by audio amplitude |
| Raymarch Tunnel | 3D raymarched tunnel responsive to beat |
| Metaball | Organic metaball shapes pulsing with audio |
| Particles | Particle system with audio-reactive forces |

## Beat Detection

AeroPlayer performs real-time onset energy analysis using a circular buffer with exponential decay (factor 0.92). Detected beats trigger visual effects across all visualizer modes.

## Post-Processing Effects

All visualizer modes support layered post-processing:

- **Vignette** — darkened edges for cinematic focus
- **Chromatic aberration** — RGB channel offset for a distortion effect
- **CRT scanlines** — retro monitor scanline overlay
- **Glitch on beat** — transient glitch effect triggered by beat detection

> **Tip:** Press **V** to cycle through all 14 visualizer modes while audio is playing.
