# Sound Files Directory

This directory is for optional audio files if you want to use pre-recorded sounds instead of Web Audio API generated sounds.

## Current Implementation

By default, $ave+ uses **Web Audio API** to generate sounds programmatically, which means:
- ✅ No files needed
- ✅ Instant playback
- ✅ Zero bandwidth
- ✅ Works offline
- ✅ Perfectly synchronized

## Adding Custom Sound Files (Optional)

If you prefer pre-recorded audio, follow these steps:

### 1. Add Sound Files

Place your audio files in this directory:
```
public/sounds/
├── coin.mp3       # Coin drop sound (50-200ms)
├── success.mp3    # Achievement chime (300-500ms)
├── click.mp3      # Button click (20-50ms)
├── goal.mp3       # Goal completion (500-1000ms)
└── ambient.mp3    # Background music (looping)
```

### 2. Recommended Specifications

**Coin Sound:**
- Format: MP3 or OGG
- Duration: 100-200ms
- Sample rate: 44.1kHz
- Bitrate: 128kbps
- Volume: Normalized to -3dB

**Success Chime:**
- Format: MP3 or OGG
- Duration: 300-500ms
- Notes: Major chord progression
- Sample rate: 44.1kHz
- Bitrate: 128kbps

**Click Sound:**
- Format: MP3 or OGG
- Duration: 20-50ms
- Type: Subtle tap/click
- Sample rate: 22.05kHz (smaller file)
- Bitrate: 64kbps

**Goal Complete:**
- Format: MP3 or OGG
- Duration: 500-1000ms
- Type: Fanfare/celebration
- Sample rate: 44.1kHz
- Bitrate: 192kbps

**Ambient Music:**
- Format: MP3 or OGG (looping)
- Duration: 60-120 seconds
- Type: Calm, minimalist
- Sample rate: 44.1kHz
- Bitrate: 128kbps
- Must loop seamlessly

### 3. Update Sound Hook

Modify `src/hooks/useSoundEffects.ts` to use files:

```typescript
// Add refs for audio elements
const coinAudioRef = useRef<HTMLAudioElement | null>(null);
const successAudioRef = useRef<HTMLAudioElement | null>(null);

// Initialize on mount
useEffect(() => {
  coinAudioRef.current = new Audio('/sounds/coin.mp3');
  successAudioRef.current = new Audio('/sounds/success.mp3');
  
  // Preload for instant playback
  coinAudioRef.current.load();
  successAudioRef.current.load();
  
  return () => {
    coinAudioRef.current = null;
    successAudioRef.current = null;
  };
}, []);

// Update sound functions
const playCoinSound = useCallback(() => {
  if (!preferences.enabled || !preferences.savingsSound) return;
  
  if (coinAudioRef.current) {
    coinAudioRef.current.volume = preferences.volume;
    coinAudioRef.current.currentTime = 0; // Reset to start
    coinAudioRef.current.play().catch(console.error);
  }
}, [preferences]);
```

### 4. Free Sound Resources

**Royalty-Free Sound Libraries:**
- [Freesound.org](https://freesound.org/) - Community sound library
- [Zapsplat.com](https://www.zapsplat.com/) - Free sound effects
- [SoundBible.com](http://soundbible.com/) - Public domain sounds
- [Mixkit.co](https://mixkit.co/free-sound-effects/) - Free effects

**Search Terms:**
- "coin drop"
- "success chime"
- "button click"
- "achievement unlock"
- "ambient music calm"

### 5. File Size Optimization

Keep files small for fast loading:
```bash
# Using ffmpeg to optimize
ffmpeg -i coin.wav -b:a 128k -ar 44100 coin.mp3
ffmpeg -i success.wav -b:a 128k -ar 44100 success.mp3
ffmpeg -i ambient.wav -b:a 128k -ar 44100 ambient.mp3
```

Target sizes:
- Coin: <50KB
- Success: <100KB
- Click: <10KB
- Goal: <150KB
- Ambient: <2MB

### 6. Browser Compatibility

All modern browsers support:
- ✅ MP3 (best compatibility)
- ✅ OGG (smaller files)
- ✅ WAV (uncompressed, large)
- ⚠️ M4A (limited support)

Recommended: Use **MP3** for maximum compatibility.

## Current vs. File-Based Comparison

| Feature | Web Audio API (Current) | Audio Files |
|---------|------------------------|-------------|
| Setup | ✅ No files needed | 📁 Requires files |
| Bandwidth | ✅ 0 bytes | ⚠️ ~2-5MB total |
| Latency | ✅ <5ms | ⚠️ 10-50ms |
| Quality | ⚠️ Synthetic | ✅ Professional |
| Customization | ⚠️ Limited | ✅ Unlimited |
| Offline | ✅ Always works | ✅ After cache |
| Realism | ⚠️ Electronic | ✅ Natural |

## Recommendation

**Stick with Web Audio API** (current implementation) unless:
- You need professional, realistic sounds
- You have specific brand audio guidelines
- You want complex sound designs
- File size/bandwidth is not a concern

The current implementation is perfect for most use cases and provides the best performance.

---

**Note:** This directory is currently empty by design. The app works perfectly without any files here!
