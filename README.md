# ✈️ TripMate AI — Autonomous Multi-Agent Travel Planner

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-1.2%2B-orange.svg)](https://www.langchain.com/langgraph)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791.svg)](https://supabase.com/)
[![Ollama](https://img.shields.io/badge/Ollama-Local%20LLM-black.svg)](https://ollama.com/)
[![Groq](https://img.shields.io/badge/Groq-Cloud%20Inference-f55036.svg)](https://groq.com/)

An autonomous multi-agent travel intelligence platform that converts natural language travel queries into comprehensive, budget-optimized itineraries with live flight availability, curated hotel recommendations, and day-by-day sightseeing schedules.

---

## 📌 Problem Statement & Motivation

Traditional trip planning is fragmented and time-consuming. Users typically navigate across multiple flight search engines, hotel booking portals, travel blogs, and mapping services while manually reconciling budgets, schedules, and group constraints.

**TripMate AI** addresses this challenge by orchestrating a team of specialized AI agents built on **LangGraph**. Each agent handles a distinct domain of travel planning, collaborating through a shared state machine to generate a unified, actionable travel plan in seconds.

---

## 🏗️ System Architecture

TripMate AI uses a **Directed Acyclic Graph (DAG)** workflow orchestrated by LangGraph. The multi-agent pipeline coordinates data extraction, tool execution, and LLM reasoning steps:

```
                      +-------------------+
                      |    User Query     |
                      +---------+---------+
                                |
                                v
                      +-------------------+
                      |   Flight Agent    |  <--->  AviationStack API
                      +---------+---------+
                                |
                                v
                      +-------------------+
                      |    Hotel Agent    |  <--->  Tavily Search API
                      +---------+---------+
                                |
                                v
                      +-------------------+
                      |  Itinerary Agent  |  <--->  LLM (Groq / Ollama)
                      +---------+---------+
                                |
                                v
                      +-------------------+
                      |    Final Agent    |  <--->  LLM Synthesizer
                      +---------+---------+
                                |
                                v
                      +-------------------+
                      | Formatted Travel  |  --->  PostgreSQL Checkpointer
                      |    Itinerary      |        (State Persistence)
                      +-------------------+
```

---

## 🤖 Multi-Agent Breakdown

| Agent Name | Primary Responsibility | Integrated Tool / Engine |
| :--- | :--- | :--- |
| **🛫 Flight Agent** | Extracts origin/destination IATA codes and retrieves real-time flight schedules. | `AviationStack API` & `airportsdata` |
| **🏨 Hotel Agent** | Conducts web research to discover top-rated accommodations matching user budget. | `Tavily Search API` |
| **📅 Itinerary Agent** | Formulates a coherent, day-by-day sightseeing and activity schedule with local tips. | `LangChain` Reasoning Prompt |
| **✨ Final Agent** | Synthesizes all data streams into a structured, presentation-ready travel briefing. | `Markdown` & UI Formatter |

---

## 🌟 Key Technical Highlights

- **Dual LLM Backend (Hybrid Cloud & Edge)**:
  - **Cloud Mode**: Ultra-low latency inference via **Groq** (`openai/gpt-oss-20b` or `qwen/qwen3.8-27b`).
  - **Local/Offline Mode**: 100% private, on-device execution via **Ollama** (`llama3.2:3b`, `qwen3:8b`) with automatic CPU fallback.
- **Stateful Checkpointing**:
  - Leverages `langgraph-checkpoint-postgres` with **Supabase Session Pooler** for persistent multi-turn conversations across threads.
  - Automatic fallback to in-memory `MemorySaver` if the database is temporarily unreachable.
- **Resilient Tool Pipeline**:
  - Intelligent airport IATA resolution supporting country aliases, city names, and multi-word queries.
  - Graceful degradation on external API timeouts or rate limits.
- **Modern Responsive Web Interface**:
  - Built with **FastAPI**, **Jinja2**, and modern glassmorphic CSS styling.
  - Features real-time generation indicators, quick prompts, markdown rendering, and copy/export functionality.

---

## 🛠️ Tech Stack

- **Backend Framework**: FastAPI, Uvicorn
- **Agent Orchestration**: LangGraph, LangChain Core
- **LLM Providers**: Groq Cloud API, Ollama (Local)
- **Database & Checkpointing**: PostgreSQL (Supabase / Neon / Local), Psycopg 3
- **External APIs**: AviationStack (Flight Schedules), Tavily AI (Web Search)
- **Data & Utilities**: airportsdata, pycountry, python-dotenv
- **Frontend**: HTML5, CSS3 (Glassmorphism design), Vanilla JavaScript

---

## 📁 Project Structure

```text
TripMate/
├── app.py                  # FastAPI application server & routing
├── backend.py              # LangGraph state machine & multi-agent definitions
├── requirements.txt        # Project dependencies
├── .env.example            # Environment variables configuration template
├── tools/
│   ├── __init__.py
│   ├── flight_tool.py      # IATA resolution & AviationStack live flight search
│   └── tavily_tool.py      # Tavily AI web search & accommodation filtering
├── templates/
│   └── index.html          # Web application UI
└── static/
    ├── style.css           # Glassmorphic dark UI styling
    └── script.js           # Client-side state handling & API calls
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10 or higher
- Git
- (Optional) [Ollama](https://ollama.com/) for local offline LLM execution

### 2. Clone the Repository
```bash
git clone https://github.com/Mitanshu4529/TripMate.git
cd TripMate
```

### 3. Create Virtual Environment
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Database Checkpointer (Supabase Pooler / Local Postgres)
DATABASE_URL=postgresql://user:password@host:5432/postgres

# LLM Provider ('groq' or 'ollama')
LLM_PROVIDER=groq
GROQ_MODEL=openai/gpt-oss-20b
GROQ_API_KEY=your_groq_api_key

# Local Ollama Settings (Optional if using Ollama)
OLLAMA_MODEL=llama3.2:3b
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_NUM_GPU=0

# External Tools
TAVILY_API_KEY=your_tavily_api_key
AVIATIONSTACK_API_KEY=your_aviationstack_api_key
DEFAULT_ORIGIN_IATA=DEL
```

---

## 💻 Running the Application

Start the FastAPI development server:
```bash
python app.py
```

Open your browser and navigate to:
```text
http://localhost:8000
```

---

## 📡 API Reference

### Health Check
- **Endpoint**: `GET /health`
- **Response**: `{"status": "healthy", "service": "TripMate AI"}`

### Generate Travel Plan
- **Endpoint**: `POST /api/travel`
- **Request Body**:
```json
{
  "message": "Plan a 5 days trip to Goa from Delhi for 3 people under 30k.",
  "thread_id": "user_session_101"
}
```
- **Response**:
```json
{
  "success": true,
  "thread_id": "user_session_101",
  "data": {
    "answer": "### 1. Trip Summary\n...",
    "flight_results": "...",
    "hotel_results": "...",
    "itinerary": "..."
  }
}
```

---

## 🔮 Future Scope

- **Real-Time Booking Integration**: Direct booking redirect via Amadeus/Skyscanner API and Booking.com APIs.
- **Interactive Map Visualization**: Route mapping with Leaflet.js / Google Maps for daily commute optimization.
- **Dynamic Expense Splitting**: Multi-user budget tracking and currency conversion.
- **Multimodal Output**: Visual itinerary cards and automated PDF export with travel vouchers.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
