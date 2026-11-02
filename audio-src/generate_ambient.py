#!/usr/bin/env python3
"""
Generates 'nook-ambient.mp3': an ORIGINAL, fully synthesised ambient loop for the Nook countdown page.

Everything is produced from scratch by this script (additive-synthesis pads, a soft synthesised piano,
a sub bass, a quiet air texture and a synthetic reverb). No samples, recordings or third-party material are
used, so there is nothing to license. Re-run to regenerate:

    python3 audio-src/generate_ambient.py          # needs numpy, scipy and ffmpeg (libmp3lame)

Piece: D major, ~64 s, four 16 s chords (Dmaj9 - Bm11 - Gmaj9 - A6/9), seamless loop (the tail is folded
back onto the head, so the pad and reverb of the last bar flow into the first).
"""
import subprocess, sys, pathlib
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt

SR = 44100
CHORD = 16.0
L = int(4 * CHORD * SR)           # loop length in samples
TAIL = int(10 * SR)               # rendered past the loop end, then folded back to the start
N = L + TAIL
rng = np.random.default_rng(7)    # fixed seed: deterministic output

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def pan_gains(p):                 # p in [-1, 1], equal-power
    a = (p + 1) * np.pi / 4
    return np.cos(a), np.sin(a)
def add(buf, start, sig, pan=0.0):
    i = int(start * SR)
    n = min(len(sig), N - i)
    if n <= 0: return
    gl, gr = pan_gains(pan)
    buf[0, i:i + n] += sig[:n] * gl
    buf[1, i:i + n] += sig[:n] * gr
def env_ar(n, a, r, sustain=1.0):
    t = np.arange(n) / SR
    e = np.minimum(1.0, t / a) ** 2
    e *= np.minimum(1.0, (n / SR - t) / r) ** 2
    return e * sustain
def lowpass(x, fc, order=2):
    sos = butter(order, fc / (SR / 2), btype='low', output='sos')
    return sosfilt(sos, x, axis=-1)
def highpass(x, fc, order=2):
    sos = butter(order, fc / (SR / 2), btype='high', output='sos')
    return sosfilt(sos, x, axis=-1)

# ---------------- harmony ----------------
CHORDS = [
    dict(bass=38, pad=[57, 62, 66, 69, 76]),   # Dmaj9
    dict(bass=35, pad=[54, 59, 62, 64, 69]),   # Bm11
    dict(bass=43, pad=[55, 62, 66, 69, 71]),   # Gmaj9
    dict(bass=45, pad=[52, 57, 61, 66, 71]),   # A6/9
]
PIANO = [  # (seconds from loop start, midi, velocity)
    (2.0, 74, .55), (4.5, 78, .5), (6.0, 81, .42), (9.0, 78, .5), (11.5, 74, .48), (13.5, 76, .4),
    (18.0, 71, .55), (20.5, 74, .5), (22.0, 78, .42), (25.0, 76, .5), (27.5, 74, .46), (29.5, 71, .4),
    (34.0, 74, .55), (36.5, 71, .5), (38.0, 79, .42), (41.0, 74, .5), (43.5, 71, .46), (45.5, 67, .4),
    (50.0, 73, .55), (52.5, 76, .5), (54.0, 81, .42), (57.0, 78, .5), (59.5, 76, .46), (61.5, 73, .4),
]

dry_pad = np.zeros((2, N)); dry_piano = np.zeros((2, N)); dry_other = np.zeros((2, N))

# ---------------- pads: detuned additive voices, slow breathing ----------------
for ci, ch in enumerate(CHORDS):
    t0 = ci * CHORD
    dur = CHORD + 6.0
    n = int(dur * SR)
    t = np.arange(n) / SR
    for ni, m in enumerate(ch['pad']):
        f0 = hz(m)
        for side, cents in ((-1, -5.0), (1, 5.0)):
            f = f0 * 2 ** (cents / 1200)
            vib = 1 + 0.0015 * np.sin(2 * np.pi * (0.13 + 0.03 * ni) * t + ni)
            phase = 2 * np.pi * np.cumsum(f * vib) / SR
            bright = 0.55 + 0.45 * np.sin(2 * np.pi * t / (11 + 2 * ni) + ci + ni)   # slow timbre movement
            sig = np.zeros(n)
            for h in range(1, 6):
                sig += (1.0 / h ** 1.35) * (bright if h > 1 else 1.0) * np.sin(h * phase)
            amp = 0.72 + 0.28 * np.sin(2 * np.pi * t / (9 + 1.7 * ni) + 1.3 * ni)
            sig *= amp * env_ar(n, 4.2, 5.5) * (0.04 if m < 60 else 0.05)
            add(dry_pad, t0, sig, pan=side * (0.35 + 0.08 * ni))
    # sub bass
    nb = int((CHORD + 4) * SR); tb = np.arange(nb) / SR
    b = np.sin(2 * np.pi * hz(ch['bass']) * tb) + 0.25 * np.sin(2 * np.pi * hz(ch['bass'] + 12) * tb)
    add(dry_other, t0, b * env_ar(nb, 2.5, 3.5) * 0.045, pan=0.0)
    # glassy bell at each chord change (root, two octaves up)
    nbell = int(7 * SR); tbell = np.arange(nbell) / SR
    root = ch['pad'][1] + 12
    bell = (np.sin(2 * np.pi * hz(root) * tbell) + 0.3 * np.sin(2 * np.pi * hz(root) * 2.01 * tbell)) * np.exp(-tbell / 2.2)
    bell *= np.minimum(1, tbell / 0.05) * 0.018
    add(dry_other, t0 + 0.2, bell, pan=0.3 * (-1) ** ci)

# ---------------- air texture: band-limited noise with a slow swell ----------------
noise = rng.standard_normal((2, N))
air = highpass(lowpass(noise, 3200), 700)
tt = np.arange(N) / SR
swell = 0.5 + 0.5 * np.sin(2 * np.pi * tt / 32 - 1.2)
dry_other += air * (0.016 + 0.020 * swell)

# ---------------- soft piano ----------------
def piano_note(m, vel, dur=8.0):
    n = int(dur * SR); t = np.arange(n) / SR
    f0 = hz(m); sig = np.zeros(n)
    for string_cents in (-3.0, 3.0):
        f = f0 * 2 ** (string_cents / 1200)
        for h in range(1, 9):
            fh = f * h * np.sqrt(1 + 0.00025 * h * h)        # slight inharmonicity
            if fh > 9000: break
            amp = (1.0 / h ** 1.1) * (vel ** (0.6 + 0.12 * h))   # softer touch = darker tone
            decay = (3.6 if m > 60 else 5.0) / (1 + 0.55 * (h - 1))
            sig += amp * np.sin(2 * np.pi * fh * t + h) * np.exp(-t / decay)
    sig *= np.minimum(1, t / 0.006) * 0.07 * (0.5 + vel)
    return sig
for (ts, m, v) in PIANO:
    add(dry_piano, ts, piano_note(m, v), pan=np.clip((m - 70) / 14, -0.6, 0.6))

# ---------------- reverb: synthetic stereo impulse response ----------------
def make_ir(rt60=4.8, length=5.2, predelay=0.03):
    n = int(length * SR); t = np.arange(n) / SR
    ir = rng.standard_normal((2, n)) * np.exp(-6.91 * t / rt60)
    ir = lowpass(ir, 5500)
    # progressively darker tail
    dark = lowpass(ir, 1600)
    w = np.clip(t / 2.5, 0, 1)
    ir = ir * (1 - w) + dark * w
    pd = int(predelay * SR)
    ir = np.concatenate([np.zeros((2, pd)), ir], axis=1)
    ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
    return ir
IR = make_ir()
def reverb(x):
    out = np.zeros((2, x.shape[1] + IR.shape[1] - 1))
    for c in range(2):
        out[c] = fftconvolve(x[c], IR[1 - c if False else c], mode='full')
    return out
wet_pad = reverb(dry_pad); wet_piano = reverb(dry_piano); wet_other = reverb(dry_other)
M = wet_pad.shape[1]
def pad_to(x, m): return np.pad(x, ((0, 0), (0, m - x.shape[1])))
mix = (pad_to(dry_pad, M) * 0.70 + wet_pad * 0.55
       + pad_to(dry_piano, M) * 0.85 + wet_piano * 0.60
       + pad_to(dry_other, M) * 0.85 + wet_other * 0.35)

# ---------------- fold the tail back onto the head => seamless loop ----------------
out = np.zeros((2, L))
for s in range(0, M, L):
    seg = mix[:, s:s + L]
    out[:, :seg.shape[1]] += seg

# ---------------- master ----------------
out = highpass(out, 40)
out = lowpass(out, 11000, order=1)
out = np.tanh(out * 1.1) / 1.1
rms = np.sqrt((out ** 2).mean())
out *= 10 ** (-21 / 20) / rms                 # ~ -21 dBFS RMS: a quiet bed that sits under the page
peak = np.abs(out).max()
if peak > 0.89: out *= 0.89 / peak
print(f"loop {L/SR:.1f}s  rms {20*np.log10(np.sqrt((out**2).mean())):.1f} dBFS  peak {20*np.log10(np.abs(out).max()):.1f} dBFS")

# seam check: sample step across the wrap point vs. typical step
seam = np.abs(out[:, 0] - out[:, -1]).max(); typ = np.abs(np.diff(out, axis=1)).max()
print(f"seam jump {seam:.5f}  (largest in-loop step {typ:.5f})")

dest = pathlib.Path(__file__).resolve().parent.parent / "assets" / "audio" / "nook-ambient.mp3"
dest.parent.mkdir(parents=True, exist_ok=True)
pcm = (np.clip(out, -1, 1).T * 32767).astype('<i2').tobytes()
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "-codec:a", "libmp3lame", "-b:a", "112k", "-joint_stereo", "1",
                "-metadata", "title=Nook ambient loop (original, generated)", "-metadata", "artist=Generated by audio-src/generate_ambient.py",
                str(dest)], input=pcm, check=True)
print("wrote", dest, dest.stat().st_size // 1024, "KB")
