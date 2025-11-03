## Testing Strategy: Verifying AI Integration of Uploaded Documents

Here is a comprehensive strategy to test whether the AI is correctly using the content from the uploaded document for Rob's account. This plan also clarifies the AI's capabilities regarding external link access.

### Part 1: Verifying Document Content Integration

The system is designed to randomly include a snippet from uploaded documents in the AI's prompt. Here’s how it works and how we can test it:

**How it Works:**
- **30% Chance of Activation:** In any given post generation, there is a 30% chance that the system will pull content from an uploaded document.
- **Random Snippet:** When activated, the system extracts a random 500-1000 character snippet from one of the uploaded documents.
- **Prompt Injection:** This snippet is then inserted into the main prompt sent to the AI, under the heading `📄 REFERENCE MATERIAL` or `Technical Reference`.

**Testing Protocol:**

To robustly test this, we need to generate a batch of posts and look for specific fingerprints from Rob's document. Given the 30% probability, I recommend generating at least **10-15 posts** to ensure a high likelihood of the feature being triggered multiple times.

**What to Look For in Generated Posts:**

1.  **Key Terminology & Nouns:** Check for the appearance of specific terms from Rob's document that are unlikely to be generated otherwise:
    *   `Tower Leasing Ltd`
    *   `FCA-regulated`
    *   `SMEs` (in the context of finance)
    *   `asset-finance`
    *   `Chris Donnelly` or `Jeff J. Hunter` (as stylistic influences)

2.  **Tone and Voice:** The AI's tone should shift to match the instructions in the document. Look for posts that are:
    *   `Confident, clear, witty in moderation`
    *   Using `British English` spellings and phrases.
    *   `Human, compliant, and useful` rather than salesy.

3.  **Content Structure and Frameworks:** The document specifies a clear content structure. Check if any of the generated posts follow this framework:
    *   `Hook → Context → Challenge → Breakthrough → Lesson + CTA`

4.  **Specific Phrases and Hooks:** The document contains example hooks. The AI might generate posts that are variations of these. Look for phrases like:
    *   `“...suffocate from cash-flow timing.”`
    *   `“...buying breathing room.”`
    *   `“Finance should read like plain English...”`

### Part 2: Verifying External Link and RSS Feed Integration

This is a key point of clarification based on the current system architecture.

**Current Capability:**
- The AI **cannot** directly access the internet or specific URLs (like the RSS feeds for `Leasing Life` or `Asset Finance Connect`) provided within the uploaded text document.
- The system **does** have a feature to fetch news, but it is tied to the **"News" post type** and uses its own internal `enhanced-news-service` which queries Google News based on the user's defined industry.
- The `website` field in a user's profile is passed to the prompt for context, but the AI does not visit the URL.

**Conclusion:**
The AI **will not** use the RSS feeds or any other links from the uploaded document as sources for content. This is a limitation of the current implementation.

**Suggested Future Enhancement:**
If Rob's use case requires integrating specific, user-defined RSS feeds, we would need to build a new feature to support this. This would involve:
1.  A new UI in the "Train Your Echo" section to add/manage custom RSS feeds.
2.  A backend service to fetch and parse these feeds.
3.  Integration with the `prompt-builder` to inject content from these custom feeds.

This would be a significant enhancement and would provide much more targeted and relevant content for the "News" post type.

### Summary of Testing Plan:

1.  **Generate 10-15 posts** for Rob's account.
2.  **Analyze the posts** for the specific keywords, tone, and structure outlined in his document.
3.  **Confirm that the AI does not** reference content from the specific external links in the document.

This testing process will give us a clear picture of how the AI is using the uploaded document and will also manage expectations about its ability to access external web content.
