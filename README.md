# AI Chat Application

A simple chat application with a HuggingFace model backend and custom React frontend.

## How to Build, Start, and Run the Project

### Prerequisites
- Docker and Docker Compose installed

### Quick Start
```bash
# Clone and navigate to project
cd huggingface-chat

# Build and start all services
docker-compose up --build

# Access the application
Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs

# Stop the application
docker-compose down
```

## Technologies Used

### Backend
- **FastAPI**: REST API framework
- **HuggingFace Transformers**: DialoGPT-small conversational AI model (117M parameters)
- **PyTorch**: Deep learning framework for model inference
- **Python 3.9+**: Core programming language

### Frontend
- **React**: Component-based UI framework
- **Tailwind CSS**: Utility-first styling framework
- **Axios**: HTTP client for API communication
- **LocalStorage**: Client-side data persistence

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

## creative choices made

### 1. Contextual Memory
- Maintains conversation context (last 4 messages) for coherent AI responses
- Proper conversation formatting for DialoGPT models
- Enables natural, flowing conversations with memory

### 2. Persistent Chat History
- Automatically saves all conversations in browser localStorage
- Dynamic conversation titles generated from first user message
- Real-time search functionality through chat history
- Multiple chat sessions with timestamps

