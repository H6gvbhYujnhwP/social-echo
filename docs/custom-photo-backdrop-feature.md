# Custom Photo Backdrop Feature - Design Document

## Overview

Allow users to upload their own photos (products, team members, office spaces, etc.) and have them professionally composited onto AI-generated backdrops with optional text and logo overlays.

## User Flow

1. **Photo Upload**
   - User clicks "Upload Custom Photo" button in ImagePanel
   - Selects image file (PNG, JPG, WEBP)
   - Photo is uploaded and stored as base64 in database
   - Preview shown in UI

2. **Backdrop Selection**
   - User provides backdrop description (e.g., "modern office", "outdoor nature")
   - OR selects from preset backdrop templates
   - AI generates backdrop image

3. **Compositing**
   - System composites user photo onto backdrop
   - User can adjust:
     - Photo position (left, center, right)
     - Photo size (small, medium, large)
     - Photo placement (foreground, background)

4. **Overlays**
   - Add text overlay (from post content)
   - Add company logo
   - Final composite image generated

## Technical Architecture

### Database Schema

Add to `Profile` model:
```prisma
customPhotos  Json?  // Array of uploaded photos: [{id, name, base64, uploadedAt}]
```

### API Endpoints

**1. Upload Custom Photo**
- `POST /api/profile/custom-photos`
- Request: FormData with image file
- Response: `{ photoId, photoUrl (base64) }`

**2. Delete Custom Photo**
- `DELETE /api/profile/custom-photos/[id]`
- Response: `{ success: true }`

**3. Generate Backdrop with Custom Photo**
- `POST /api/generate-backdrop`
- Request: `{ photoId, backdropDescription, photoPosition, photoSize, includeText, includeLogo }`
- Response: `{ imageUrl (base64), backdropUrl, compositeUrl }`

### Image Compositing Service

Create `lib/image-compositing.ts`:

```typescript
interface CompositeOptions {
  backdropBase64: string
  photoBase64: string
  position: 'left' | 'center' | 'right'
  size: 'small' | 'medium' | 'large'
  placement: 'foreground' | 'background'
}

async function compositeImages(options: CompositeOptions): Promise<string>
```

**Implementation:**
- Use Sharp library for image processing
- Resize user photo based on size setting
- Position photo on backdrop
- Add subtle shadow/glow for depth
- Return composite as base64

### Backdrop Generation

Extend existing image generation:
- Generate backdrop with DALL-E 3
- Ensure backdrop has appropriate space for photo placement
- Use prompts like "professional backdrop for product photography"

## UI Components

### CustomPhotoUpload Component

Location: `components/CustomPhotoUpload.tsx`

Features:
- Upload button
- Photo gallery (show all uploaded photos)
- Delete photo button
- Select photo for use

### ImagePanel Updates

Add new section:
- "Use Custom Photo" toggle
- Photo selector dropdown
- Backdrop description input
- Position/size controls
- Preview of selected photo

## User Experience

**Before:**
- Users can only generate AI images
- No way to use their own product photos or team photos

**After:**
- Upload product photos, team photos, office photos
- Generate professional backdrops
- Create marketing images with real photos + AI backgrounds
- Full control over composition

## Example Use Cases

1. **Product Marketing**
   - Upload product photo
   - Generate "luxury showroom" backdrop
   - Add promotional text + logo

2. **Team Announcements**
   - Upload team member photo
   - Generate "modern office" backdrop
   - Add announcement text + logo

3. **Event Promotion**
   - Upload event venue photo
   - Generate "vibrant event atmosphere" backdrop
   - Add event details + logo

## Technical Considerations

### Image Size Limits
- Max upload: 5MB (same as logo)
- Supported formats: PNG, JPG, WEBP
- Auto-resize if too large

### Storage
- Store as base64 in database (consistent with logo approach)
- Max 5 photos per user (to manage database size)
- Each photo ~500KB average = ~2.5MB total per user

### Performance
- Backdrop generation: ~10-15 seconds (DALL-E 3)
- Compositing: <1 second (Sharp is fast)
- Total: ~15 seconds (acceptable)

### Error Handling
- Invalid file format → Clear error message
- File too large → Suggest compression
- Backdrop generation fails → Retry or use default
- Compositing fails → Show original photo

## Implementation Plan

1. **Phase 1:** Photo upload API + database
2. **Phase 2:** Compositing service
3. **Phase 3:** Backdrop generation integration
4. **Phase 4:** UI components
5. **Phase 5:** Testing + deployment

## Future Enhancements

- Background removal (remove.bg API)
- Multiple photos in one image
- Photo filters/adjustments
- Template library (preset backdrops)
- Batch processing (generate multiple variants)
