from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch
from datetime import datetime
from typing import List, Optional
import logging
from config import MODEL_NAME, MAX_INPUT_LENGTH, MAX_RESPONSE_TOKENS, TEMPERATURE, ALLOWED_ORIGINS, API_HOST, API_PORT

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Assistant Chat API",
    description="A chat API powered by HuggingFace models with contextual memory",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models


class ChatRequest(BaseModel):
    message: str
    context: Optional[List[str]] = []


class ChatResponse(BaseModel):
    response: str
    timestamp: str


# Global variables for model and tokenizer
model = None
tokenizer = None
generator = None


def load_model():
    """Load the HuggingFace model and tokenizer"""
    global model, tokenizer, generator

    try:
        logger.info(f"Loading {MODEL_NAME} model...")

        # Load tokenizer and model
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

        # Add padding token if not present
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token

        # Create text generation pipeline
        generator = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            device=0 if torch.cuda.is_available() else -1
        )

        logger.info("Model loaded successfully!")

    except Exception as e:
        logger.error(f"Error loading model: {e}")
        raise e


@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    import asyncio
    # Load model in background to avoid blocking startup
    asyncio.create_task(load_model_async())


async def load_model_async():
    """Load model asynchronously"""
    try:
        load_model()
    except Exception as e:
        logger.error(f"Failed to load model: {e}")


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy" if model is not None else "loading",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Generate a response based on user message and conversation context
    """
    try:
        if not generator:
            raise HTTPException(status_code=503, detail="Model not loaded")

        # Format input for DialoGPT conversation
        if request.context:
            # Build conversation history
            conversation = []
            # Use last 4 messages (2 exchanges)
            for i, message in enumerate(request.context[-4:]):
                if i % 2 == 0:  # User message
                    conversation.append(f"User: {message}")
                else:  # Bot message
                    conversation.append(f"Assistant: {message}")

            # Add current user message
            conversation.append(f"User: {request.message}")
            input_text = "\n".join(conversation)
        else:
            # First message in conversation
            input_text = f"User: {request.message}"

        # Limit input length to prevent resource exhaustion
        if len(input_text) > MAX_INPUT_LENGTH:
            input_text = input_text[:MAX_INPUT_LENGTH]

        logger.info(f"Generating response for: {input_text}")

        # Generate response with better parameters
        response = generator(
            input_text,
            max_length=len(tokenizer.encode(input_text)) + MAX_RESPONSE_TOKENS,
            num_return_sequences=1,
            temperature=TEMPERATURE,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id,
            repetition_penalty=1.1  # Prevent repetitive responses
        )

        # Extract generated text
        generated_text = response[0]["generated_text"]

        # Extract the assistant's response
        if "Assistant:" in generated_text:
            # Find the last Assistant response
            parts = generated_text.split("Assistant:")
            if len(parts) > 1:
                ai_response = parts[-1].strip()
                # Remove any trailing User: if present
                if "User:" in ai_response:
                    ai_response = ai_response.split("User:")[0].strip()
            else:
                ai_response = generated_text.strip()
        else:
            # Fallback: remove the input text
            if input_text in generated_text:
                ai_response = generated_text[len(input_text):].strip()
            else:
                ai_response = generated_text.strip()

        # Clean up the response
        ai_response = ai_response.split('\n')[0]  # Take first line only
        ai_response = ai_response.strip()

        # Better fallback responses
        if not ai_response or len(ai_response) < 3:
            ai_response = "I'm not sure how to respond to that. Could you rephrase your question?"
        elif ai_response.lower() in ["i understand. please tell me more about that.", "i understand"]:
            ai_response = "I'm here to help! What would you like to know?"

        logger.info(f"Generated response: {ai_response}")

        return ChatResponse(
            response=ai_response,
            timestamp=datetime.now().isoformat()
        )

    except Exception as e:
        logger.error(f"Error generating response: {e}")
        # Graceful fallback
        return ChatResponse(
            response="I'm having trouble processing your request right now. Please try again in a moment.",
            timestamp=datetime.now().isoformat()
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=API_HOST, port=API_PORT)
