## Custom RSS Feed Manager: Technical Design & Implementation Plan

**Version:** 1.0  
**Date:** November 3, 2025

### 1. Overview

This document outlines the technical design for implementing a **Custom RSS Feed Manager** within the Social Echo platform. This feature will allow users to add their own RSS feeds, which the AI will use as a source of inspiration for generating timely and relevant content. The design ensures seamless integration with the existing architecture, including the AI prompt builder and the "Train Your Echo" page, while preserving the crucial element of randomization in post generation.

### 2. System Architecture & Components

The implementation will touch upon the database, backend services, API, and frontend. The architecture is designed to be modular and scalable.

#### 2.1. Database Schema (`prisma/schema.prisma`)

A new table, `CustomRssFeed`, will be created to store user-defined RSS feeds. This keeps the data normalized and separate from the `Profile` model.

```prisma
// In prisma/schema.prisma

model CustomRssFeed {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  url       String   // The URL of the RSS feed
  name      String?  // An optional, user-friendly name for the feed
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, url]) // Prevent duplicate URLs per user
  @@index([userId])
}

// Add the new relation to the User model
model User {
  // ... existing fields
  customRssFeeds CustomRssFeed[]
}
```

**Justification:**
- **Normalization:** A dedicated table is cleaner than storing an array of URLs in the `Profile` JSON, allowing for easier querying, indexing, and management.
- **Scalability:** This structure can easily accommodate future enhancements, such as tracking the last time a feed was fetched or storing cached feed items.
- **Data Integrity:** The `@@unique([userId, url])` constraint prevents users from adding the same feed multiple times.

#### 2.2. Backend Service (`lib/rss/custom-rss-service.ts`)

A new service will be created to handle the logic of fetching, parsing, and selecting articles from the user's custom RSS feeds. This service will be modeled after the existing `enhanced-news-service.ts`.

**Key Functions:**

- `fetchAndParseFeeds(userId: string): Promise<Headline[]>`: Fetches all `CustomRssFeed` URLs for a given user, parses them using the `rss-parser` library, and returns a consolidated list of recent articles (e.g., from the last 7 days).
- `getRandomArticle(userId: string): Promise<Headline | null>`: A wrapper function that calls `fetchAndParseFeeds` and returns a single, randomly selected article. This will be the primary function used by the AI service.

**Randomization Logic:**
The service will fetch items from all of the user's feeds and then randomly select one article from the entire collection. This ensures that content can be pulled from any of the user's sources, maintaining variety.

#### 2.3. API Endpoints (`app/api/profile/rss-feeds/route.ts`)

Standard RESTful endpoints will be created for managing the RSS feeds.

- **`GET /api/profile/rss-feeds`**: Secure endpoint that returns a list of the authenticated user's saved RSS feeds (`{ id, url, name }`).
- **`POST /api/profile/rss-feeds`**: Secure endpoint that accepts a `{ url: string, name?: string }` payload. It will validate the URL (e.g., check if it's a valid format and attempt to parse it) before creating a new `CustomRssFeed` record.
- **`DELETE /api/profile/rss-feeds`**: Secure endpoint that accepts a `{ id: string }` payload to delete a specific RSS feed by its ID.

#### 2.4. AI Service Integration (`lib/ai/ai-service.ts`)

The core AI service will be updated to incorporate the new custom RSS feed content, using a probabilistic approach to maintain randomization.

**Integration Logic:**
1.  Inside the main `generatePost` function, after fetching the user's profile, a new probabilistic check will be added:

    ```typescript
    // In lib/ai/ai-service.ts
    let customRssArticle: Headline | null = null;
    // 40% chance to use a custom RSS feed article, if the user has any feeds
    if (user.customRssFeeds.length > 0 && Math.random() < 0.4) {
      customRssArticle = await getRandomArticle(userId);
    }
    ```

2.  The `customRssArticle` (if not null) will be passed into the `buildGenInputs` function and subsequently to the `prompt-builder`.

**Why a separate probability?**
This ensures that using a custom RSS feed and using an uploaded document snippet are independent events. The AI could potentially use both, one, or neither in any given generation, maximizing content diversity.

#### 2.5. Prompt Builder Integration (`lib/ai/prompt-builder.ts`)

The prompt builder will be updated to conditionally add the custom RSS article to the prompt.

```typescript
// In lib/ai/prompt-builder.ts

// Add to GenInputs type
export type GenInputs = {
  // ... existing fields
  customRssArticle?: { title: string; contentSnippet: string; source: string; };
}

// In the main prompt building logic
const rssContext = inputs.customRssArticle
  ? `\n\n📰 CUSTOM FEED INSIGHT (use this as inspiration for a timely post):\n- Source: ${inputs.customRssArticle.source}\n- Title: ${inputs.customRssArticle.title}\n- Snippet: ${inputs.customRssArticle.contentSnippet}`
  : '';

// Append ${rssContext} to the main prompt body
```

#### 2.6. Frontend UI (`app/train/page.tsx`)

A new React component, `RssFeedManager`, will be created and added to the "Train Your Echo" page.

**Component Features:**
-   **Form:** A simple input field for the RSS feed URL and an optional name field.
-   **List:** Displays the list of currently saved feeds, fetched from the `GET` endpoint.
-   **Delete Button:** Each item in the list will have a delete button that calls the `DELETE` endpoint.
-   **State Management:** The component will use `useState` to manage the list of feeds and the form inputs.

### 3. Implementation & Integration Plan

1.  **Database:** Add the `CustomRssFeed` model to `schema.prisma` and run `npx prisma migrate dev`.
2.  **Backend:**
    -   Create the `lib/rss/custom-rss-service.ts` file and implement the fetching/parsing logic.
    -   Create the `app/api/profile/rss-feeds/route.ts` file and implement the GET, POST, and DELETE handlers.
3.  **AI Integration:**
    -   Modify `lib/ai/ai-service.ts` to add the probabilistic check and call the new RSS service.
    -   Update `lib/ai/prompt-builder.ts` to include the `customRssArticle` in the prompt context.
4.  **Frontend:**
    -   Create the `components/RssFeedManager.tsx` component.
    -   Integrate the `RssFeedManager` into the `app/train/page.tsx` file.
5.  **Testing:**
    -   Write unit tests for the `custom-rss-service`.
    -   Perform end-to-end testing by adding a feed, generating multiple posts, and verifying that the AI uses the feed content approximately 40% of the time.

This design provides a clear and robust path to implementing the Custom RSS Feed Manager, ensuring it is a powerful, well-integrated, and reliable feature.
