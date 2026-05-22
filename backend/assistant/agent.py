import json
import re
import requests
from .models import Task

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "llama3:8b"   # you can change this to qwen2.5:7b

def serialize_tasks(tasks):
    return [
        {
            "id": task.id,
            "title": task.title,
            "completed": task.completed,
        }
        for task in tasks
    ]

def extract_json(text: str):
    """
    Ollama models sometimes return extra text.
    This tries to recover the first JSON object.
    """
    try:
        return json.loads(text)
    except Exception:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
    raise ValueError("Model did not return valid JSON")

def ask_ollama(message: str, tasks):
    task_text = "\n".join(
        [f'{t.id}. {t.title} - {"done" if t.completed else "not done"}' for t in tasks]
    ) or "No tasks yet."

    system_prompt = f"""
You are a helpful task management AI agent.

You must reply with JSON only and no extra text.

Allowed actions:
- create_task
- list_tasks
- mark_done
- mark_undone
- delete_task
- delete_multiple_tasks
- reply

JSON format:
{{
  "action": "create_task|list_tasks|mark_done|mark_undone|delete_task|delete_multiple_task|reply",
  "args": {{}},
  "reply": "short natural language reply"
}}

Rules:
- If user wants to add a task, use create_task.
- If user wants to mark a task complete, use mark_done.
- If user wants to remove a task, use delete_task.
- If user only asks what exists, use list_tasks.
- If the request is not about tasks, use reply.
- For create_task, args must include "title".
- For mark_done and delete_task, args must include "task_id".

Current tasks:
{task_text}
""".strip()

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message},
        ],
        "stream": False,
        "options": {"temperature": 0.2},
    }

    response = requests.post(OLLAMA_URL, json=payload, timeout=120)
    response.raise_for_status()
    data = response.json()
    content = data["message"]["content"]
    return extract_json(content)

def run_agent(message: str):
    tasks = Task.objects.all().order_by("-created_at")[:20]
    decision = ask_ollama(message, tasks)

    action = decision.get("action", "reply")
    args = decision.get("args", {})
    reply = decision.get("reply", "Done.")

    if action == "create_task":
        title = args.get("title")
        if title:
            Task.objects.create(title=title)
            reply = reply or f"Created task: {title}"

    elif action == "list_tasks":
        reply = reply or "Here are your tasks."

    elif action == "mark_done":
        task_id = args.get("task_id")
        if task_id:
            task = Task.objects.filter(id=task_id).first()
            if task:
                task.completed = True
                task.save()
                reply = reply or f"Marked task #{task_id} as done."
    
    elif action == "mark_undone":
        task_id = args.get("task_id")
        if task_id:
            task = Task.objects.filter(id=task_id).first()
            if task:
                task.completed = False
                task.save()
                reply = reply or f"Marked task #{task_id} as not done."

    elif action == "delete_task":
        task_id = args.get("task_id")
        if task_id:
            Task.objects.filter(id=task_id).delete()
            reply = reply or f"Deleted task #{task_id}."
    
    elif action == "delete_multiple_tasks":
        task_ids = args.get("task_ids", [])
        if task_ids:
            deleted_count, _ = Task.objects.filter(id__in=task_ids).delete()
            reply = reply or f"Deleted {deleted_count} task(s)."

    # Return fresh tasks after action
    updated_tasks = Task.objects.all().order_by("-created_at")
    return {
        "action": action,
        "reply": reply,
        "tasks": serialize_tasks(updated_tasks),
    }
