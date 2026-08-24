PLATFORM_SPECS = {
    "X": {
        "char_limit": 280,
        "tone": "punchy, conversational, hook-driven",
        "hashtags": "1–3 hashtags max",
        "note": "Front-load the hook in the first sentence. Every word must earn its place."
    },
    "Instagram": {
        "char_limit": 2200,
        "tone": "visual storytelling, emotional, authentic",
        "hashtags": "5–10 relevant hashtags",
        "note": "Start with a compelling first line since captions are truncated. Emojis used sparingly are effective."
    },
    "LinkedIn": {
        "char_limit": 3000,
        "tone": "professional, insight-driven, narrative",
        "hashtags": "3–5 professional hashtags",
        "note": "Use line breaks generously. Start with a bold statement or question. End with a clear call-to-action or question to drive comments."
    }
}

def build_prompt(text: str, platform: str) -> str:
    spec = PLATFORM_SPECS[platform]
    return f"""You are an expert social media strategist specializing in {platform} content.

Analyze the following social media post and provide a detailed engagement improvement analysis.

Platform: {platform}
Character Limit: {spec['char_limit']} characters
Optimal Tone: {spec['tone']}
Hashtag Strategy: {spec['hashtags']}
Platform Note: {spec['note']}

Post to Analyze:
\"\"\"
{text}
\"\"\"

Provide your analysis as a structured JSON response with:
- score: An engagement score from 0 to 100 based on the platform's best practices
- tone: The detected tone of the current post (2–4 words)
- strengths: List of EXACTLY 2 short, specific things working well (max 1 sentence each)
- improvements: List of EXACTLY 2 specific, actionable improvements needed (max 1 sentence each)
- rewritten_post: A fully rewritten version optimized for {platform} (MUST be under {spec['char_limit']} characters)
- hashtags: {spec['hashtags']} relevant to this content
- character_count: The exact character count of your rewritten_post
- platform_notes: One specific tip unique to {platform} for this content

Be specific and actionable. Avoid generic advice."""
