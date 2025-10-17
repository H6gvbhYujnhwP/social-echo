# Features Page Demo Videos

## Recording Instructions

### Setup
1. Run demo seed script: `npx ts-node scripts/seed-demo.ts`
2. Sign in with demo account:
   - Email: `demo+features@socialecho.ai`
   - Password: `demo123`
3. Use screen recording tool (QuickTime, OBS, or browser extension)
4. Record at 1280×720 or 1080×1080 resolution
5. Keep videos 3-5 seconds each
6. Export as H.264 MP4, muted, <2MB each

---

## Video 1: `generator-demo.mp4`
**Scene:** Post Generation Flow

**Steps to Record:**
1. Open Planner page
2. Click on "Coffee Shop – Autumn Specials" item
3. Click "Generate" button
4. Show draft appearing in text area
5. Type in refinement: "Make the opener more catchy + add ☕"
6. Click "Generate" again
7. Show updated draft with changes

**Duration:** 4-5 seconds  
**Focus:** Show the generation process and quick refinement

---

## Video 2: `imagegen.mp4`
**Scene:** Image Generation

**Steps to Record:**
1. Scroll to image generation section
2. Paste prompt: "Cozy coffee shop scene with warm autumn tones, a pumpkin spice latte with latte art on a wooden table, surrounded by cinnamon sticks and maple leaves, morning sunlight, minimal background text, realistic photographic style"
3. Click "Generate Image" button
4. Show loading state
5. Show image thumbnail appearing

**Duration:** 4-5 seconds  
**Focus:** Show image generation process

---

## Video 3: `feedback.mp4`
**Scene:** Feedback Interaction

**Steps to Record:**
1. Show the generated draft
2. Hover over thumbs up button
3. Click thumbs up (👍)
4. Show "Thanks! Learning..." toast notification
5. Brief pause to show confirmation

**Duration:** 3-4 seconds  
**Focus:** Show feedback mechanism

---

## Video 4: `success.mp4`
**Scene:** Copy to Clipboard

**Steps to Record:**
1. Show final draft with image
2. Click "Copy" button
3. Show "Copied!" toast notification
4. Pan slightly to show Planner list with item marked complete
5. Optional: Show success checkmark or status change

**Duration:** 3-4 seconds  
**Focus:** Show completion and success state

---

## Post-Production

### Optimization
```bash
# Use ffmpeg to optimize videos
ffmpeg -i input.mp4 -vcodec h264 -b:v 2M -acodec aac -b:a 128k -s 1280x720 output.mp4

# Remove audio track (muted)
ffmpeg -i input.mp4 -an -vcodec copy output.mp4

# Compress to target size
ffmpeg -i input.mp4 -vcodec h264 -crf 28 -preset slow output.mp4
```

### Naming Convention
- `generator-demo.mp4` - Post generation
- `imagegen.mp4` - Image generation
- `feedback.mp4` - Feedback interaction
- `success.mp4` - Copy and success

### File Requirements
- Format: MP4 (H.264)
- Resolution: 1280×720 or 1080×1080
- Duration: 3-5 seconds
- File Size: <2MB each
- Audio: Muted (no audio track)
- Loopable: Seamless loop preferred

---

## Coffee Shop Demo Content

### Post Prompt (for recording)
```
Create a LinkedIn post for a local coffee shop announcing our Autumn specials: 
pumpkin spice latte, maple pecan cold brew, and cinnamon swirl muffins. 
Tone: cozy, welcoming, and community-driven. Keep it under 120 words and 
include one short CTA to "drop by this week for a taste of fall!"
```

### Refinement Prompt
```
Make the opening line more catchy and add one coffee emoji ☕
```

### Image Prompt
```
Cozy coffee shop scene with warm autumn tones, a pumpkin spice latte with 
latte art on a wooden table, surrounded by cinnamon sticks and maple leaves, 
morning sunlight, minimal background text, realistic photographic style
```

---

## Placeholder Videos

Until real recordings are available, placeholder videos can be created:

1. **Static Frame:** Export a screenshot as a 1-frame video
2. **Text Overlay:** Add "Demo Video Coming Soon" text
3. **Gradient Background:** Use brand colors with animation
4. **Icon Animation:** Animate the step icon

---

## Testing

After adding videos:
1. Check autoplay works (muted + playsInline required)
2. Verify loop is seamless
3. Test on mobile (iOS Safari, Android Chrome)
4. Check file sizes (<2MB each)
5. Verify accessibility (aria-labels present)
6. Test with reduced motion preference enabled

---

## Notes

- **Privacy:** Use demo account only, no real user data
- **Branding:** Ensure UI matches current production design
- **Quality:** High-quality screen recording, no artifacts
- **Consistency:** Same UI theme across all videos
- **Performance:** Optimize for fast loading on mobile

