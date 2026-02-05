"""
FastAPI Application Entry Point

This is a minimal FastAPI application with no endpoints defined.
Use this as a starting point to add your own endpoints and functionality.
"""

from fastapi import FastAPI
from contextlib import asynccontextmanager


# Application lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifespan events.
    Code before yield runs on startup, code after yield runs on shutdown.
    """
    # Startup
    print("🚀 FastAPI application starting up...")
    yield
    # Shutdown
    print("👋 FastAPI application shutting down...")


# Initialize FastAPI application
app = FastAPI(
    title="FastAPI Skeleton",
    description="A minimal FastAPI application ready for endpoint development",
    version="1.0.0",
    lifespan=lifespan
)