# Image Generator Integration

## Overview

Social Echo now uses **three different image generators** optimized for different visual styles:

1. **Flux Pro 1.1** (Replicate) - Photo-Real style
2. **Ideogram v3 Turbo** (Replicate) - Infographic style  
3. **DALL-E 3** (OpenAI) - All other styles

## Why Multiple Generators?

Each AI model has different strengths:

- **Flux Pro 1.1**: Best-in-class photorealism, natural human faces, professional photography quality
- **Ideogram v3 Turbo**: Excellent at rendering text + visuals (charts, infographics, data visualizations)
- **DALL-E 3**: Reliable for illustrations, memes, conceptual art, and general-purpose images

## Routing Logic

The system automatically routes to the appropriate generator based on the selected visual style:

```typescript
if (imageType === 'photo-real') {
  // Use Flux Pro 1.1 for photorealistic images
  imageBase64 = await generateFluxProImage(imagePrompt)
} else if (imageType === 'infographic') {
  // Use Ideogram v3 Turbo for infographics with text
  imageBase64 = await generateIdeogramImage(imagePrompt)
} else {
  // Use DALL-E 3 for everything else
  imageBase64 = await generateImage(imagePrompt)
}
```

## Visual Style Mapping

| Visual Style | Generator | Cost per Image | Best For |
|-------------|-----------|----------------|----------|
| Photo-Real | Flux Pro 1.1 | $0.04 | Professional photography, realistic people, corporate headshots |
| Infographic | Ideogram v3 Turbo | $0.04 | Data visualizations, charts with labels, text-heavy designs |
| Illustration | DALL-E 3 | ~$0.04 | Vector-style art, clean compositions, metaphorical concepts |
| Meme | DALL-E 3 | ~$0.04 | Expressive faces, meme templates, viral formats |
| Funny | DALL-E 3 | ~$0.04 | Exaggerated scenes, humorous situations |
| Controversial | DALL-E 3 | ~$0.04 | Surreal concepts, thought-provoking imagery |
| Conceptual | DALL-E 3 | ~$0.04 | Abstract ideas, symbolic representations |

## API Configuration

### Environment Variables Required

```bash
# OpenAI (for DALL-E 3)
OPENAI_API_KEY=sk-...

# Replicate (for Flux Pro and Ideogram)
REPLICATE_API_TOKEN=r8_...
```

### Replicate Setup

1. Sign up at https://replicate.com/
2. Add payment method (pay-as-you-go, no subscription)
3. Generate API token in Account Settings
4. Add token to Render environment variables

## Cost Analysis

**Before (DALL-E 3 only):**
- All images: ~$0.04-0.08 per image
- Quality: Good for most use cases, but photorealism was lacking

**After (Multi-generator):**
- Photo-Real: $0.04 per image (Flux Pro)
- Infographic: $0.04 per image (Ideogram)
- Other styles: ~$0.04 per image (DALL-E 3)
- **Total cost impact: Minimal** (same or lower per-image cost)
- **Quality improvement: Significant** (especially for Photo-Real and Infographic)

## Example Outputs

### Photo-Real (Flux Pro 1.1)
- Natural human expressions
- Professional lighting and depth of field
- Authentic photography quality
- Realistic skin tones and textures

### Infographic (Ideogram v3 Turbo)
- Clean text rendering (no gibberish)
- Data visualizations with labels
- Charts and graphs with proper typography
- Professional design aesthetics

### Illustration (DALL-E 3)
- Clean vector-style artwork
- Bold colors and clear shapes
- Metaphorical concepts
- Consistent quality

## Implementation Files

- `/lib/replicate-image.ts` - Replicate API client and generator functions
- `/app/api/generate-image/route.ts` - Updated routing logic
- `/lib/ai/image-service.ts` - Prompt generation (unchanged)

## Testing

To test the new generators:

1. Log in to Social Echo
2. Generate a **Photo-Real** post - should use Flux Pro
3. Generate an **Infographic** post - should use Ideogram
4. Generate an **Illustration** post - should use DALL-E 3
5. Check console logs for generator confirmation

## Deployment Checklist

- [x] Install `replicate` package
- [x] Create Replicate image service
- [x] Update generate-image API route
- [x] Add routing logic for Photo-Real and Infographic
- [x] Test TypeScript compilation
- [ ] Add REPLICATE_API_TOKEN to Render environment variables
- [ ] Deploy to production
- [ ] Test with real accounts

## Monitoring

Check Render logs for:
```
[generate-image] Using Flux Pro 1.1 for photorealistic image
[generate-image] Using Ideogram v3 Turbo for infographic
[generate-image] Using DALL-E 3 for illustration
```

## Rollback Plan

If issues occur:
1. Remove REPLICATE_API_TOKEN from environment
2. Revert to previous commit
3. System will fall back to DALL-E 3 for all styles

## Future Enhancements

- Add Midjourney integration (requires unofficial API wrapper)
- Add user preference for generator selection
- Add cost tracking per generator
- Add A/B testing for generator quality comparison
