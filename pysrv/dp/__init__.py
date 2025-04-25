"""
minimalist fastapi server that
- serves a static file from ./docs/editor/index.html
- saves JSON data on POST to /api/data_point
- serves the saved JSON data on GET to /api/data_point
"""

# pylint: disable=import-error
import json
import logging
from pathlib import Path
from typing import Any, Dict

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Serve static files from the ./docs/editor/index.html directory
app.mount(
    "/static",
    StaticFiles(directory=Path(__file__).parent.parent.parent / "docs", html=True),
    name="static",
)

data: Dict[str, Any] = {}


# redirect from / to /static/index.html
@app.get("/", response_class=RedirectResponse)
async def redirect_to_index():
    """
    Redirects the root URL to the static index.html file.
    """
    return RedirectResponse(url="/static/editor/index.html")


@app.get("/api/data_point", response_class=JSONResponse)
async def get_data_point():
    """
    Returns the JSON data saved in memory.
    If the data is not found, raises a 404 error.
    """
    if not data:
        raise HTTPException(status_code=404, detail="Data not found")
    return JSONResponse(content=data)


@app.post("/api/data_point", response_class=JSONResponse)
async def post_data_point(request: Request):
    """
    Saves the JSON data sent in the request body to memory.
    Returns the saved data as a JSON response.
    """
    try:
        # logger.info("Received data: %s", await request.body())
        jdata = await request.json()
        # logger.info("Parsed data: %s", jdata)
        if not isinstance(jdata, list):
            raise HTTPException(status_code=400, detail="Invalid data format")
        return JSONResponse(content=jdata)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid JSON format") from exc


def main():
    """
    Run the FastAPI server.
    """
    uvicorn.run(app, host="localhost", port=8099, log_level="info")
