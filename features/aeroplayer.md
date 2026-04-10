# AeroPlayer

AeroPlayer is AeroFTP's built-in audio player, designed for previewing audio files directly within the file manager. It uses native HTML5 `<audio>` with a Web Audio API processing graph for real-time audio manipulation and visualization. AeroPlayer replaced the Howler.js library with a direct Web Audio API architecture for lower latency and finer control over the audio pipeline.

## Audio Engine

Audio is routed through a Web Audio API processing graph that applies equalization, stereo panning, and frequency analysis in real-time:

```text
Audio Source → 10-Band EQ → Stereo Panner → Analyser → Destination
```

A prebuffer strategy ensures smooth playback start by buffering a minimum of 6 seconds of audio data before initiating playback. This prevents stuttering on slower network connections when playing remote files.

## Player Interface

The player interface provides standard transport controls (play, pause, stop, seek) alongside the equalizer sliders, stereo balance control, and a visualizer canvas that responds to the audio in real-time.

![AeroPlayer with equalizer and visualizer](/images/aeroplayer-main.png)
<!-- SCREENSHOT: AeroPlayer showing the transport controls, 10-band EQ sliders, stereo balance knob, and an active visualizer mode (e.g., frequency bars or waveform) -->

## 10-Band Equalizer

Each band uses a dedicated Web Audio `BiquadFilterNode` for precise frequency shaping. Adjust individual sliders to boost or cut specific frequency ranges, or select a preset for instant configuration.

| Band | Frequency | Character |
| ---- | --------- | --------- |
| 1 | 32 Hz | Sub-bass (felt more than heard) |
| 2 | 64 Hz | Bass body and weight |
| 3 | 125 Hz | Bass punch and warmth |
| 4 | 250 Hz | Low-mid fullness |
| 5 | 500 Hz | Mid-range body |
| 6 | 1 kHz | Mid-range presence |
| 7 | 2 kHz | Upper-mid clarity |
| 8 | 4 kHz | Presence and attack |
| 9 | 8 kHz | Brilliance and sibilance |
| 10 | 16 kHz | Air and sparkle |

### EQ Presets

Ten built-in presets are available for quick setup:

- **Flat** - all bands at 0 dB (neutral)
- **Bass Boost** - enhanced low frequencies
- **Treble Boost** - enhanced high frequencies
- **Vocal** - mid-range emphasis for voice clarity
- **Rock** - scooped mids with boosted lows and highs
- **Pop** - slight bass and treble lift
- **Jazz** - warm low-mid emphasis
- **Classical** - gentle high-frequency lift
- **Electronic** - sub-bass and treble emphasis
- **Loudness** - compensates for low-volume listening (bass and treble boost)

### Stereo Balance

A `StereoPannerNode` provides continuous left/right balance control. The panner ranges from -1 (full left) to +1 (full right), with 0 as center. This is useful for compensating asymmetric headphone output or for creative stereo positioning.

## Visualizer Modes

AeroPlayer offers 14 visualization modes that respond to the audio in real-time. Press the **V** key to cycle through all modes while audio is playing.

![WebGL visualizer active during playback](/images/aeroplayer-visualizer.png)
<!-- SCREENSHOT: AeroPlayer with one of the WebGL visualizer modes active (e.g., Raymarch Tunnel or Metaball), showing the full-canvas GPU-rendered visualization responding to audio -->

### Canvas 2D Modes (8 modes)

Standard 2D visualizations rendered on an HTML5 Canvas:

| Mode | Description |
| ---- | ----------- |
| Waveform | Oscilloscope-style time-domain waveform |
| Frequency Bars | Vertical bars representing frequency spectrum |
| Circular Spectrum | Frequency data arranged in a radial pattern |
| Oscilloscope | High-resolution time-domain display |
| Mirrored Bars | Frequency bars mirrored vertically |
| Gradient Bars | Frequency bars with color gradient fills |
| Dot Matrix | Frequency data as a grid of animated dots |
| Line Spectrum | Smooth line tracing the frequency curve |

### WebGL 2 Modes (6 modes)

GPU-accelerated shader-based visualizations that create immersive audio-reactive graphics. These run entirely on the GPU via WebGL 2 fragment shaders, ported from the CyberPulse visualization engine:

| Shader | Description |
| ------ | ----------- |
| **Wave Glitch** | Distorted waveform with glitch artifacts that intensify on beats |
| **VHS** | Retro VHS tape effect with scanlines, color bleeding, and tracking noise |
| **Mandelbrot** | Fractal zoom driven by audio amplitude - deeper zoom on louder passages |
| **Raymarch Tunnel** | 3D raymarched tunnel that pulses and distorts in response to beats |
| **Metaball** | Organic metaball shapes that pulse, merge, and split with the audio |
| **Particles** | Particle system with audio-reactive forces - particles scatter on beats |

> **Tip:** Press **V** to cycle through all 14 visualizer modes. WebGL modes require GPU support and are automatically skipped on systems without WebGL 2 capability.

## Beat Detection

AeroPlayer performs real-time onset energy analysis to detect beats in the audio stream. The algorithm uses:

- **Circular buffer** - stores recent energy samples for comparison
- **Exponential decay** (factor 0.92) - smooths energy tracking to distinguish genuine beats from sustained loudness
- **Onset threshold** - a beat is registered when the current energy exceeds the rolling average by a configurable margin

Detected beats trigger synchronized visual effects across all visualizer modes, creating a responsive audio-visual experience.

## Post-Processing Effects

All visualizer modes (both Canvas 2D and WebGL) support layered post-processing effects that add cinematic character to the visualization:

| Effect | Description |
| ------ | ----------- |
| **Vignette** | Darkened edges that draw focus to the center of the visualization |
| **Chromatic aberration** | RGB channel offset creating a prismatic distortion around edges |
| **CRT scanlines** | Retro monitor scanline overlay for a vintage CRT display look |
| **Glitch on beat** | Transient glitch distortion triggered by beat detection - frame displacement, color shift, and horizontal tearing |

Post-processing effects are composited in order: the base visualization renders first, then vignette, chromatic aberration, scanlines, and finally beat-triggered glitch. Effects can be combined for layered visual complexity.
