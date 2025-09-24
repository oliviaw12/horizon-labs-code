from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

# Quickstart example for OpenRouter with OpenAI Python SDK
client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=api_key
)

completion = client.chat.completions.create(
  extra_headers={
    "HTTP-Referer": "<YOUR_SITE_URL>", # Optional. Site URL for rankings on openrouter.ai.
    "X-Title": "<YOUR_SITE_NAME>", # Optional. Site title for rankings on openrouter.ai.
  },
  model="google/gemini-2.0-flash-exp:free",  # Using Gemini 2.0 free model
  messages=[
    {
      "role": "user",
      "content": "What is the meaning of life?"
    }
  ]
)

print(completion.choices[0].message.content)
