// app/help/content.ts
export const helpContent = {
  title: "Help & AI Integrator",
  intro:
    "Your one-stop guide to mastering SocialEcho — from training your Echo to crafting high-impact, non-repetitive content that fits your brand.",
  sections: [
    {
      id: "getting-started",
      title: "Getting Started",
      body: `
**1) Create your account**  
Choose Starter or Pro. Starter includes a 1-day trial.

**2) Train your Echo**  
Open **Train** and add brand voice notes, audience, examples, and preferred topics. The more you add (even short snippets), the better the results.

**3) Generate your first posts**  
Go to **Planner → Generate**. Start with a short objective (e.g., "weekly tip about LinkedIn outreach for MSPs").

**4) Refine drafts quickly**  
Use short instructions like:
- "Add a stronger hook"
- "Make this friendlier and human"
- "Add a one-line CTA"
- "Give me 3 variations"

**5) Publish & learn**  
Your edits and feedback ("Good / Needs work") teach your **private** model — learning is per-user only.
`,
    },
    {
      id: "generator",
      title: "Using the Generator (Prompt Tips)",
      body: `
**Keep prompts short + specific**, then iterate. Examples:
- "Make this confident and B2B-friendly"
- "Keep under 120 words, add emojis sparingly"
- "Target IT buyers; stress ROI"
- "Reframe as a story with a lesson"

**Layer prompts** for fine control: start broad ("tone: authoritative") then add specifics ("include 1 statistic and a CTA to comment").

**Style presets that work well**
- Hook → Insight → CTA
- Myth → Truth → Action
- Story → Lesson → Invitation
`,
    },
    {
      id: "improvement",
      title: "Improving Drafts & Preventing Repetition",
      body: `
Your Echo adapts from your **edits + feedback**. To stay fresh:

- Ask for **variations**: "Give me 3 different angles"
- **Rephrase** stale lines: "Rewrite with a playful tone"
- Rotate **post structures** (hook/story/list/FAQ/mini-case)
- Use **negative edits**: "Remove buzzwords", "Less hype, more clarity"

If something keeps repeating, say:  
"Avoid reusing the phrases: {list} in this and future drafts."
`,
    },
    {
      id: "billing",
      title: "Account & Billing",
      body: `
Manage everything under **Account** (Starter/Pro only):

- **Change plan** (upgrade/downgrade)
- **Cancel / Reactivate**
- **Update card** and **download invoices**
- **Email preferences** and **security (password & 2FA)**

Billing is handled via Stripe's secure portal.  
Need help? Email **support@socialecho.ai**.
`,
    },
    {
      id: "ai",
      title: "AI Integrator Assistant",
      body: `
Use the floating **Help & AI** button any time.

It can:
- Answer product questions (Train, Planner, Generator)
- Coach prompts and improve drafts
- Suggest non-repetitive variations
- Help with billing/account questions
- Point to the right settings or page

Try these quick prompts:
- "Add a stronger hook and 2 variation options"
- "Rewrite for small business owners, friendlier"
- "Shorten to 90–110 words with 1 emoji"
- "Explain how to cancel or change plan"
`,
    },
  ],
};

export type HelpSection = typeof helpContent.sections[number];

