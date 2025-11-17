## Executive Summary

This report details the investigation into the user-reported issue where the "Brief the AI (optional)" feature was not effectively directing the AI's post generation. Our deep-dive analysis of the codebase confirms that while the user's prompt is being successfully passed to the AI, its instructions are framed as secondary "additional instructions" rather than a primary directive. This causes the AI to prioritize its own randomized topic selection over the user's specific request, leading to the perception that the brief is being ignored.

The recommended solution is to re-engineer the AI prompts to conditionally make the user's brief the central focus of the post, overriding the default topic randomization when a brief is provided. This will ensure the AI generates content directly based on the user's input, as intended.

## 1. Current Implementation: How the User Brief is Processed

Our investigation traced the data flow from the user interface to the final AI prompt construction. The system is correctly capturing and transmitting the user's input through the entire stack.

1.  **Dashboard UI (`TodayPanel.tsx`)**: The "Brief the AI (optional)" text area correctly captures the user's input and stores it in the `userPrompt` state variable.

2.  **API Call (`dashboard/page.tsx`)**: When the "Generate New Post" button is clicked, the `userPrompt` is included in the API request payload sent to `/api/generate-text`.

    ```typescript
    // /app/dashboard/page.tsx
    const requestData = {
      // ... other profile data
      user_prompt: userPrompt || '',
    }
    ```

3.  **AI Service (`ai-service-v8.8.ts`)**: The API endpoint receives the `user_prompt` and passes it to the core AI generation service as a "twist" or modification to the standard generation process.

    ```typescript
    // /lib/ai/ai-service-v8.8.ts
    draft = await buildAndGenerateDraftV8({
      // ... other data
      twists: {
        note: validatedRequest.user_prompt || undefined,
      },
    })
    ```

4.  **Prompt Builder (`prompt-builder.ts`)**: The AI service then passes this `note` to the final prompt builder, which constructs the text that is sent to the AI model.

## 2. The Root Cause: Flawed Prompt Engineering

The core of the issue lies not in a bug, but in **flawed prompt engineering**. The AI is correctly receiving the user's brief, but the instructions that accompany it are not strong enough to make it the primary focus.

The system first randomly selects a `focusTopic` from the user's profile (e.g., a specific product or service). It then instructs the AI to write about that topic, while including the user's brief as secondary "additional instructions."

This creates a conflict for the AI. It is being told to focus on a specific, randomized topic while also considering the user's note. In most cases, it defaults to the more structured, primary instruction (the random topic) and only lightly incorporates the user's brief.

### Prompt Framing Discrepancy

We discovered a significant difference in how the user's brief is framed depending on the post type, which explains why it might work for some posts but not others.

| Post Type | Prompt Framing for User's Brief | Priority | Result |
| :--- | :--- | :--- | :--- |
| **Selling** | `🎯 USER'S CUSTOM BRIEF (HIGHEST PRIORITY):\nIf the user has provided specific instructions above, prioritize those over the randomized focus.` | **High** | The AI is explicitly told to prioritize the user's brief. |
| **Info & Advice** | `Additional Instructions:` | **Low** | The AI treats the brief as an optional, secondary suggestion. |
| **Random / Fun** | `Additional Instructions:` | **Low** | The AI treats the brief as an optional, secondary suggestion. |
| **News** | `AdditionalInstructions:` | **Low** | The AI treats the brief as an optional, secondary suggestion. |

As shown in the table, only the "Selling" post type gives the user's brief high priority. For all other types, the instructions are too weak, causing the AI to follow its primary directive to write about a randomized topic.

## 3. Recommended Solution

To resolve this issue, the prompt engineering must be updated to conditionally make the user's brief the **central focus** of the generation, overriding the default topic randomization.

When a user provides a brief, they are explicitly stating their desired topic. The AI prompt should be modified to reflect this intent.

### Proposed Code Change

The logic should be changed in the prompt builder files (e.g., `/lib/ai/prompt-builder.ts`) for each post type.

**Current Logic (Simplified):**
```typescript
// 1. A random topic is always selected
const focusTopic = randomSelect(allProducts, 1)[0];

// 2. The prompt tells the AI to focus on the random topic
//    and adds the user's brief as a weak, secondary instruction.
return `Generate a post about ${focusTopic}.

Additional Instructions: ${inputs.notes}`;
```

**Recommended Logic (Simplified):**
```typescript
// 1. Determine the focus topic: use the user's brief if it exists, otherwise pick a random topic.
const focusTopic = inputs.notes ? `the user's specific brief` : randomSelect(allProducts, 1)[0];

// 2. Construct the prompt instructions around the chosen focus.
let userBriefSection = '';
if (inputs.notes) {
  userBriefSection = `🎯 USER'S CUSTOM BRIEF (HIGHEST PRIORITY):\n${inputs.notes}\n\nThis is the main topic for the post. All other context is for background information only.`;
} else {
  userBriefSection = `🎯 FOCUS TOPIC FOR THIS POST: ${focusTopic}`;
}

// 3. Build the final prompt with the user's brief as the primary directive.
return `Generate a post based on the following focus:\n\n${userBriefSection}`;
```

By implementing this change for **all post types**, the "Brief the AI" feature will function as users expect, giving them direct control over the content generation when they choose to use it. This will significantly improve the user experience and the perceived intelligence of the platform.
