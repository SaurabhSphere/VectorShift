# VectorShift Pipeline Backend

A high-performance Python ASGI backend powered by **FastAPI** and validated via **Pydantic**. It acts as the pipeline topology verification service, counting nodes/edges and checking for Directed Acyclic Graph (DAG) cycles using Kahn's topological sorting algorithm.

---

## 🚀 Setup & Local Installation

### Prerequisites
*   **Python**: v3.9 or later.
*   **pip**: Python package manager.

### 1. Create and Activate a Virtual Environment
It is highly recommended to isolate your dependencies using a Python virtual environment:

*   **Windows (PowerShell):**
    ```powershell
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    ```
*   **Windows (Command Prompt):**
    ```cmd
    python -m venv venv
    .\venv\Scripts\activate.bat
    ```
*   **macOS / Linux:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

### 2. Install Dependencies
Install all required Python packages from the `requirements.txt` file:
```bash
pip install -r requirements.txt
```

### 3. Run the Development Server
Start the local development server using Uvicorn:
```bash
uvicorn main:app --reload --port 8000
```
*   The backend server will run on [http://localhost:8000](http://localhost:8000).
*   You can inspect the interactive OpenAPI documentation (Swagger UI) at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 🌐 Production Deployment
The production backend API is hosted on Render's free tier:
*   **Production URL:** [https://vectorshift-7itg.onrender.com/](https://vectorshift-7itg.onrender.com/)

### CORS Configurations
To enable secure cross-origin resource sharing with cookies/credentials allowed, wildcard origins are disabled in favor of an explicit whitelist:
*   `http://localhost:3000` & `http://127.0.0.1:3000` (Local Dev)
*   `http://localhost:3001` & `http://127.0.0.1:3001` (Fallback Local Dev)
*   `https://vectorshiftyc.netlify.app` (Netlify Production Frontend)
