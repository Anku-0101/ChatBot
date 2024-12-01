import uvicorn

if __name__ == "__main__":
    print("Starting application...")
    uvicorn.run("api.main:app", host="0.0.0.0", port=8001, reload=True)
