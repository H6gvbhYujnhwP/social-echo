# Report: "Brief the AI" vs. "Custom Instructions"

**Date:** November 3, 2025  
**Author:** Manus AI

## 1. Introduction

This report details the functionality of two key user input fields in the Social Echo platform: **"Brief the AI (optional)"** and **"Custom Instructions (Optional)"**. Understanding their distinct roles is crucial for effectively guiding the AI in post generation and refinement.

## 2. "Brief the AI (optional)"

This field is used during the **initial generation of a new post**.

### 2.1. Purpose

The primary purpose of the "Brief the AI" field is to give the user a way to provide **high-priority, specific instructions** for a new post. It allows the user to override or guide the AI's creative process for a single generation.

### 2.2. Technical Implementation

When a user provides input in the "Brief the AI" field, the text is passed to the AI prompt builder as `inputs.notes`. The prompt then includes the following section, giving it the highest priority:

```typescript
${inputs.notes ? `\n🎯 USER'S CUSTOM BRIEF (HIGHEST PRIORITY):\n${inputs.notes}\n\nIf the user has provided specific instructions above, prioritize those over the randomized focus.` : ''}
```

This ensures that the AI pays close attention to the user's brief, making it the most influential factor in the generation process.

### 2.3. Use Cases

- Launching a new product: "Focus on the launch of our new CRM for small businesses."
- Promoting an event: "Write a post about our upcoming webinar on financial planning."
- Highlighting a specific benefit: "Emphasize the cost-saving aspects of our service."

## 3. "Custom Instructions (Optional)"

This field is used when **regenerating or refining an existing post**.

### 3.1. Purpose

The "Custom Instructions" field is designed to allow users to **modify an existing post** that the AI has already generated. It's a tool for iterative refinement, not for creating a new post from scratch.

### 3.2. Technical Implementation

When a user enters text in the "Custom Instructions" field and clicks "Apply & Regenerate," the input is passed to a specialized `buildRefinementPrompt`. This prompt instructs the AI to **modify the original post** based on the user's instructions, rather than creating a new one.

The core of the refinement prompt is:

```typescript
// You are refining an EXISTING LinkedIn post. Your task is to MODIFY the post based on the user's instructions while keeping the core structure and message intact.

ORIGINAL POST:
"""
${inputs.originalPost}
"""

USER'S REFINEMENT INSTRUCTIONS:
"""
${userInstructions}
"""
```

This makes it clear to the AI that it should be editing, not creating.

### 3.3. Use Cases

- Changing the tone: "Make the post more casual and friendly."
- Adding a specific detail: "Add a sentence about our 24/7 customer support."
- Shortening the post: "Make the post more concise and to the point."

## 4. Key Differences Summarized

| Feature | "Brief the AI (optional)" | "Custom Instructions (Optional)" |
| :--- | :--- | :--- |
| **When to Use** | Creating a **new** post | **Modifying** an existing post |
| **AI's Task** | Generate from scratch, with guidance | Edit and refine an existing draft |
| **Input's Role** | High-priority creative direction | Specific modification requests |
| **Example** | "Write about our new mobile app" | "Change the call to action to 'Download now'" |

## 5. Conclusion

"Brief the AI" and "Custom Instructions" are two distinct and powerful tools for controlling the AI's output. "Brief the AI" is for providing initial direction, while "Custom Instructions" is for iterative refinement. Using them correctly will lead to better, more targeted content that meet the user's specific needs.
