#!/usr/bin/env python3
"""
Vinamilk storefront cinematic reveal video — 5s, 9:16 (1080x1920)
Phase 0-2s : Ken Burns zoom-in + day→dusk→night colour grade
Phase 2-3s : Morph + light sweep + bloom transition to img2
Phase 3-5s : img2 final with glow, sparks, bright-flash reveal
"""

import math, os
import numpy as np
from PIL import Image, ImageFilter
from moviepy import VideoClip

FPS      = 30
DURATION = 5.0
W, H     = 1080, 1920

IMG1 = "/root/.claude/uploads/93a19966-9e31-45fb-bb8c-1772c29a15d5/0682dd47-1000030239.jpg"
IMG2 = "/root/.claude/uploads/93a19966-9e31-45fb-bb8c-1772c29a15d5/2d5a6de4-1000030240.png"
OUT  = "/home/user/tiktok/vinamilk_reveal.mp4"

# ─── helpers ────────────────────────────────────────────────────────────────

def cover_resize(path: str, w: int, h: int) -> np.ndarray:
    img = Image.open(path).convert("RGB")
    iw, ih = img.size
    scale = max(w / iw, h / ih)
    img = img.resize((round(iw * scale), round(ih * scale)), Image.LANCZOS)
    nw, nh = img.size
    img = img.crop(((nw - w) // 2, (nh - h) // 2,
                    (nw - w) // 2 + w, (nh - h) // 2 + h))
    return np.array(img, dtype=np.float32)


def smoothstep(x: float) -> float:
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def ease_in(x: float, power: float = 2.0) -> float:
    return max(0.0, min(1.0, x)) ** power


# ─── effects ────────────────────────────────────────────────────────────────

def ken_burns(base: np.ndarray, t: float, t_end: float,
              zoom: float = 1.12, pan_up: float = 0.04) -> np.ndarray:
    """Slow zoom-in and slight upward pan."""
    p = t / t_end
    h, w = base.shape[:2]
    z = 1.0 + (zoom - 1.0) * p
    nw, nh = max(1, int(w / z)), max(1, int(h / z))
    cx = w // 2
    cy = int(h / 2 - h * pan_up * p)
    x1 = max(0, cx - nw // 2)
    y1 = max(0, cy - nh // 2)
    x1 = min(x1, w - nw)
    y1 = min(y1, h - nh)
    crop = Image.fromarray(base[y1:y1+nh, x1:x1+nw].astype(np.uint8))
    return np.array(crop.resize((w, h), Image.LANCZOS), dtype=np.float32)


def day_to_night(arr: np.ndarray, p: float) -> np.ndarray:
    """Colour-grade from day (p=0) to warm evening (p=1)."""
    p = max(0.0, min(1.0, p))
    out = arr.copy()

    # 1. Overall darkening (sky / ambient)
    out *= (1.0 - p * 0.52)

    # 2. Blue shift in general (cooler ambient)
    out[:, :, 0] *= 1.0 - p * 0.18   # less red
    out[:, :, 2] *= 1.0 + p * 0.20   # more blue

    # 3. Warm golden halo on sign / facade (middle vertical band)
    sy1, sy2 = int(H * 0.30), int(H * 0.72)
    mask = np.zeros((H, W, 1), dtype=np.float32)
    mask[sy1:sy2] = 1.0
    # Horizontal fade from centre
    xs = np.linspace(-1, 1, W, dtype=np.float32) ** 2
    mask[:] *= (1 - xs)[np.newaxis, :, np.newaxis] * 0.6 + 0.4
    warm = np.array([1.10, 0.80, 0.20], dtype=np.float32) * mask * p * 0.28
    out = out + out * warm

    # 4. Bright "neon rim" along the building edges (1 px white glow sim)
    edge_strength = p * 40
    out[int(H*0.30):int(H*0.32), :] = np.clip(
        out[int(H*0.30):int(H*0.32)] + edge_strength, 0, 255)
    out[int(H*0.65):int(H*0.67), :] = np.clip(
        out[int(H*0.65):int(H*0.67)] + edge_strength * 0.6, 0, 255)

    return np.clip(out, 0, 255)


def bloom(arr: np.ndarray, radius: int = 20, strength: float = 0.35) -> np.ndarray:
    img_pil = Image.fromarray(arr.astype(np.uint8))
    blurred = img_pil.filter(ImageFilter.GaussianBlur(radius))
    return np.clip(arr + np.array(blurred, dtype=np.float32) * strength, 0, 255)


def light_sweep(arr: np.ndarray, p: float) -> np.ndarray:
    """Diagonal / horizontal light streak across the frame."""
    h, w = arr.shape[:2]
    # Sweep from left to right; p in [0,1]
    sweep_x = int(p * (w + 200)) - 100
    xs = np.arange(w, dtype=np.float32)
    dist = np.abs(xs - sweep_x)
    beam = np.maximum(0.0, 1.0 - dist / 130) ** 1.8 * 220.0
    # Tilt the beam slightly
    ys = np.arange(h, dtype=np.float32)
    tilt_offset = (ys - h / 2) * 0.15
    tilted_beam = np.zeros((h, w), dtype=np.float32)
    for y_idx in range(h):
        shift = int(tilt_offset[y_idx])
        src_x = xs - shift
        valid = (src_x >= 0) & (src_x < w)
        ix = np.clip(src_x.astype(int), 0, w - 1)
        tilted_beam[y_idx] = np.where(valid, beam[ix], 0.0)
    overlay = tilted_beam[:, :, np.newaxis] * np.array([1.0, 0.97, 0.85])
    return np.clip(arr + overlay, 0, 255)


def spark_particles(arr: np.ndarray, count: int, t: float) -> np.ndarray:
    """Gold/white spark particles scattered across the facade."""
    rng = np.random.default_rng(int(t * 2000) % (2**31))
    h, w = arr.shape[:2]
    out = arr.copy()
    # Bias particles toward the building facade (centre region)
    fy1, fy2 = int(h * 0.20), int(h * 0.85)
    xs = rng.integers(0, w, count)
    ys = rng.integers(fy1, fy2, count)
    sizes = rng.integers(1, 5, count)
    flickers = rng.uniform(0.4, 1.0, count)
    for x, y, s, f in zip(xs, ys, sizes, flickers):
        for dy in range(-s, s + 1):
            for dx in range(-s, s + 1):
                ny, nx = int(y + dy), int(x + dx)
                if 0 <= ny < h and 0 <= nx < w:
                    d = math.hypot(dx, dy)
                    if d <= s:
                        alpha = (1 - d / max(s, 1)) * f
                        # Alternating gold / white
                        colour = np.array([255.0, 240.0, 140.0] if rng.integers(2) else
                                          [255.0, 255.0, 230.0])
                        out[ny, nx] = np.clip(
                            out[ny, nx] * (1 - alpha) + colour * alpha, 0, 255)
    return out


# ─── pre-compute heavy arrays ─────────────────────────────────────────────

print("Loading images…")
a1 = cover_resize(IMG1, W, H)
a2 = cover_resize(IMG2, W, H)

# Pre-bake night+Ken-Burns end-state of img1 used in blend phase
_night_end = day_to_night(ken_burns(a1, 2.0, 2.0), 1.0)

print(f"Image shapes: {a1.shape}, {a2.shape}")


# ─── frame generator ─────────────────────────────────────────────────────

def make_frame(t: float) -> np.ndarray:

    # ── Phase 1 : 0–2 s ──────────────────────────────────────────────────
    if t <= 2.0:
        arr = ken_burns(a1, t, 2.0)
        night_p = ease_in(max(0.0, (t - 0.25) / 1.75), 1.8)
        arr = day_to_night(arr, night_p)
        if night_p > 0.55:
            arr = bloom(arr, radius=12, strength=0.18 * (night_p - 0.55) / 0.45)

    # ── Phase 2 : 2–3.2 s — transition ───────────────────────────────────
    elif t <= 3.2:
        p = (t - 2.0) / 1.2            # 0 → 1
        blend = smoothstep(p)

        arr = _night_end * (1.0 - blend) + a2 * blend
        arr = np.clip(arr, 0, 255)

        # Light sweep timed to sweep across during 2–3.2 s
        arr = light_sweep(arr, smoothstep(p))

        # Growing bloom as img2 takes over
        arr = bloom(arr, radius=22, strength=0.25 * blend)

        # Bright flash right at the cut (t≈2.0 → 2.15)
        if t < 2.15:
            flash = (1 - (t - 2.0) / 0.15) * 0.4
            arr = np.clip(arr + flash * 255, 0, 255)

    # ── Phase 3 : 3.2–5 s — final reveal ─────────────────────────────────
    else:
        arr = a2.copy()

        # Persistent warm bloom on final image
        arr = bloom(arr, radius=28, strength=0.30)

        # Sparks: ramp up 3.2–3.8 s, hold
        spark_p = smoothstep(min(1.0, (t - 3.2) / 0.6))
        n_sparks = int(220 * spark_p)
        if n_sparks > 0:
            arr = spark_particles(arr, n_sparks, t)

        # Brief entrance flash
        if t < 3.5:
            flash = (1 - (t - 3.2) / 0.3) * 0.25
            arr = np.clip(arr + flash * 255, 0, 255)

        # Subtle vignette to focus eye on building
        ys = np.linspace(-1, 1, H, dtype=np.float32) ** 2
        xs = np.linspace(-1, 1, W, dtype=np.float32) ** 2
        vignette = 1.0 - np.sqrt(ys[:, np.newaxis] + xs[np.newaxis, :]) * 0.22
        vignette = np.clip(vignette, 0, 1)[:, :, np.newaxis]
        arr = np.clip(arr * vignette, 0, 255)

    return arr.astype(np.uint8)


# ─── render ──────────────────────────────────────────────────────────────

print(f"Rendering {FPS*DURATION:.0f} frames @ {FPS} fps → {OUT}")
clip = VideoClip(make_frame, duration=DURATION)
clip.write_videofile(
    OUT,
    fps=FPS,
    codec="libx264",
    audio=False,
    preset="medium",
    bitrate="8000k",
    logger="bar",
)
print("✓ Done:", OUT)
