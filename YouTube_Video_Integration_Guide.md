# YouTube Video Integration Guide

## Step 1: Upload Video to YouTube

1. Go to [YouTube Studio](https://studio.youtube.com/)
2. Click **"Create"** → **"Upload videos"**
3. Upload the `SocialEcho.mp4` file
4. Fill in video details:
   - **Title:** "Social Echo Demo - AI Social Media Content Generator"
   - **Description:** "See how Social Echo generates professional LinkedIn posts in seconds. Train your AI, build your brand, from £29.99/month."
   - **Visibility:** Public or Unlisted (Unlisted if you only want people with the link to see it)
5. Click **"Publish"**

## Step 2: Get YouTube Embed Code

1. After publishing, click on the video
2. Click **"Share"** button
3. Click **"Embed"**
4. Copy the iframe code (it will look like this):

```html
<iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" 
title="YouTube video player" frameborder="0" 
allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
allowfullscreen></iframe>
```

## Step 3: Add to Homepage

Open `/home/ubuntu/social-echo/app/(marketing)/page.tsx` and add this section after line 89 (after the hero section):

```tsx
        {/* Video Demo Section */}
        <section className="px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                See Social Echo in Action
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Watch how easy it is to generate professional social media content in seconds
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black/50 backdrop-blur-sm"
            >
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-xl"
                  src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                  title="Social Echo Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </div>
        </section>
```

**Replace `YOUR_VIDEO_ID`** with the actual YouTube video ID from Step 2.

## Step 4: Deploy

```bash
cd /home/ubuntu/social-echo
git add app/(marketing)/page.tsx
git commit -m "feat: Add YouTube video demo to homepage"
git push origin main
```

Render will auto-deploy in 2-3 minutes (much faster without the 68MB video file!).

## Benefits of YouTube Hosting

✅ **Fast deployments** - No large files in Git  
✅ **Better performance** - YouTube's CDN is optimized for video streaming  
✅ **Easy updates** - Replace video on YouTube without redeploying  
✅ **Analytics** - Track views, engagement, and watch time  
✅ **Mobile optimized** - YouTube handles all device compatibility  

## Optional: Customize YouTube Player

Add these parameters to the YouTube URL for better control:

- `?autoplay=1` - Auto-play on page load (not recommended for UX)
- `?mute=1` - Start muted (required if using autoplay)
- `?controls=0` - Hide player controls
- `?rel=0` - Don't show related videos at the end
- `?modestbranding=1` - Hide YouTube logo

Example:
```
https://www.youtube.com/embed/YOUR_VIDEO_ID?rel=0&modestbranding=1
```
