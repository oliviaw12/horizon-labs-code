# Create your views here.
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings
from openai import OpenAI
import os
from dotenv import load_dotenv
import json

# Used https://medium.com/@oviyan007/how-to-build-an-ai-chatbot-in-django-using-google-gemini-api-beginner-friendly-56598066166c 
# as reference to build this file and the chat interface.

# Configure OpenAI client for OpenRouter
load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")
chat = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)

# Supported OpenRouter models (free tiers)
ALLOWED_MODELS = {
    "google/gemini-2.0-flash-exp:free": "Gemini 2.0 Flash",
    "x-ai/grok-4-fast:free": "Grok 4 Fast",
    "mistralai/mistral-nemo:free": "Mistral Nemo",
}

DEFAULT_MODEL = next(iter(ALLOWED_MODELS))

# View to handle chat interface
@csrf_exempt
def chatbot_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user_message = data.get("message")
        model_id = data.get("model") or DEFAULT_MODEL
        if model_id not in ALLOWED_MODELS:
            model_id = DEFAULT_MODEL
        # Send message to the LLM and get a response
        response = chat.chat.completions.create(
            model=model_id,
            messages=[
                {"role": "user", "content": user_message}
            ]
        )
        bot_reply = response.choices[0].message.content
        return JsonResponse({
            "reply": bot_reply,
            "model_label": ALLOWED_MODELS[model_id],
        })
    return render(request, "chat/chat.html")
