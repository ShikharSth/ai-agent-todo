# AI Task Automation Assistant

A simple full-stack AI-powered task management application built with:

- Django REST Framework (DRF)
- React + Vite + TailwindCSS
- Ollama Local LLMs (`llama3:8b`, `qwen2.5:7b`)

The application allows users to manage tasks using natural language.

Example:

- "Add a task to study DRF"
- "Mark task 4 as done"
- "Delete completed tasks"
- "Show my tasks"

The AI interprets user intent and the backend executes predefined actions safely.

---

# Project Type

## Is this an AI Agent or AI Automation?

This project is best described as:

# ✅ AI-Powered Automation System
or
# ✅ Tool-Calling AI Assistant

It uses an LLM to understand natural language and convert it into structured backend actions.

Example flow:

```text
User Message
    ↓
LLM understands intent
    ↓
Structured JSON action
    ↓
Backend executes safe predefined logic
    ↓
Database updated
```

Example:

```json
{
  "action": "mark_done",
  "args": {
    "task_id": 4
  },
  "reply": "Task 4 marked as done"
}
```

---

# Why This Is NOT a Fully Autonomous AI Agent

This project does NOT:

- self-plan
- reason in loops
- dynamically discover tools
- autonomously pursue goals
- perform multi-step reasoning
- maintain long-term memory

Instead, it executes predefined backend functions safely.

This architecture is intentional because it is:

- predictable
- secure
- beginner-friendly
- production-friendly
- easy to debug
- easier to scale

Many real-world "AI agents" in production follow this same architecture.

---

# Features

## AI Features

- Natural language understanding
- Structured JSON action generation
- Tool-calling architecture
- Local LLM execution using Ollama
- Safe backend execution layer

## Task Features

- Create tasks
- List tasks
- Mark tasks done
- Mark tasks undone
- Delete single task
- Delete multiple tasks

## Tech Features

- Django REST Framework
- ModelViewSet + Serializer
- SQLite database
- React frontend
- TailwindCSS UI
- REST APIs
- Local AI inference

---

# Tech Stack

## Backend

- Python
- Django
- Django REST Framework
- SQLite
- Ollama API

## Frontend

- React
- Vite
- TailwindCSS
- Axios

## AI Models

Tested with:

- `llama3:8b`
- `qwen2.5:7b`

---

# Architecture

```text
┌─────────────┐
│ React Frontend
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────┐
│ Django DRF API
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ AI Agent Layer
│ (agent.py)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Ollama LLM
└──────┬──────┘
       │ JSON Action
       ▼
┌─────────────┐
│ Backend Tool Execution
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ SQLite Database
└─────────────┘
```

---

# Folder Structure

```bash
backend/
├── assistant/
│   ├── admin.py
│   ├── agent.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
│
├── config/
│   ├── settings.py
│   └── urls.py
│
└── manage.py


frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── vite.config.js
└── package.json
```

---

# Setup Guide

# 1. Clone Project

```bash
git clone git@github.com:ShikharSth/ai-agent-todo.git
cd ai-agent-todo
```

---

# 2. Install Ollama

Install Ollama from:

https://ollama.com

Verify installation:

```bash
ollama --version
```

---

# 3. Pull Models

```bash
ollama pull llama3:8b
```

or

```bash
ollama pull qwen2.5:7b
```

List installed models:

```bash
ollama list
```

---

# 4. Start Ollama

```bash
ollama serve
```

Ollama runs at:

```text
http://localhost:11434
```

---

# Backend Setup

# 5. Create Virtual Environment

```bash
python -m venv venv
```

Activate:

Mac/Linux:

```bash
source venv/bin/activate
```

Windows:

```bash
venv\Scripts\activate
```

---

# 6. Install Backend Dependencies

```bash
pip install django djangorestframework django-cors-headers requests
```

---

# 7. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

# 8. Start Backend Server

```bash
python manage.py runserver
```

Backend runs at:

```text
http://127.0.0.1:8000
```

---

# Frontend Setup

# 9. Install Frontend Dependencies

```bash
cd frontend

npm install
npm install axios
npm install tailwindcss @tailwindcss/vite
```

---

# 10. Start Frontend

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

# API Endpoints

## Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks/` | List tasks |
| POST | `/api/tasks/` | Create task |
| PATCH | `/api/tasks/:id/` | Update task |
| DELETE | `/api/tasks/:id/` | Delete task |

---

## AI Chat

| Method | Endpoint |
|---|---|
| POST | `/api/agent/chat/` |

Request:

```json
{
  "message": "Add a task to study DRF"
}
```

Response:

```json
{
  "action": "create_task",
  "reply": "Task created successfully",
  "tasks": []
}
```

---

# Supported AI Actions

```text
- create_task
- list_tasks
- mark_done
- mark_undone
- delete_task
- delete_multiple_tasks
- reply
```

---

# Example Prompts

```text
Add a task to buy milk
Create a task called study AI
Show my tasks
Mark task 3 done
Mark task 3 undone
Delete task 2
Delete tasks 1 and 4
```

---

# How the AI Works

The backend sends:

- user message
- current task list
- system prompt

to the local Ollama model.

The model returns structured JSON only.

Example:

```json
{
  "action": "delete_task",
  "args": {
    "task_id": 3
  },
  "reply": "Deleted task 3"
}
```

The backend validates and safely executes the action.

---

# Important Security Concept

The LLM NEVER directly controls the database.

The backend is always the final authority.

Bad:

```python
eval(ai_response)
```

Good:

```python
if action == "delete_task":
    delete_task()
```

This protects the system from unsafe AI outputs.

---

# Current Limitations

## 1. No Real Memory

The AI does not remember previous conversations.

---

## 2. No Multi-Step Reasoning

The AI performs only one action per request.

Example:

```text
User → One AI decision → One backend action
```

---

## 3. No Autonomous Planning

The system cannot independently create plans or workflows.

---

## 4. Prompt-Based Tool Calling

Actions are determined using prompt engineering instead of native function calling.

---

## 5. Local Model Accuracy

Smaller local models may occasionally:

- return invalid JSON
- hallucinate task IDs
- misunderstand instructions

---

## 6. No Authentication

Currently all APIs are public.

---

# Future Improvements

## AI Improvements

### Native Function Calling

Replace prompt-based JSON with real structured function calling.

---

### Multi-Step Agent Loop

Implement:

```text
Think → Act → Observe → Repeat
```

---

### Long-Term Memory

Store conversation history and preferences.

---

### Dynamic Tool Registry

Allow the AI to discover tools dynamically.

Example:

```python
TOOLS = {
    "create_task": create_task,
    "send_email": send_email,
    "calendar": calendar_tool,
}
```

---

### Streaming Responses

Use streaming tokens from Ollama for real-time chat.

---

## Backend Improvements

- JWT Authentication
- PostgreSQL
- Docker support
- Celery background tasks
- Rate limiting
- Validation layer
- Async task execution

---

## Frontend Improvements

- Better chat UI
- Dark/light mode
- Real-time updates
- Typing indicators
- Mobile responsiveness
- Chat history

---

# Recommended Next Steps

After understanding this project, try building:

- AI Note Taking Assistant
- AI Email Assistant
- AI Calendar Assistant
- AI Research Assistant
- Multi-tool AI Agent
- Retrieval-Augmented Generation (RAG)
- Voice-enabled AI Assistant

---

# Learning Concepts Covered

This project teaches:

- DRF ModelViewSet
- DRF Serializers
- REST APIs
- React state management
- TailwindCSS
- AI tool calling
- Prompt engineering
- Backend safety validation
- Local LLM integration
- AI workflow architecture

---

# License

MIT License

---

# Author

GitHub: @ShikharSth

Built for learning AI Engineering concepts using:

- Django REST Framework
- React
- Ollama
- Local LLMs
