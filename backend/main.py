from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import io
import os
import shutil
import tempfile

import texeldb

app = FastAPI(title="TexelDB API", description="Convert files to GIF and back")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
async def root():
    return {"message": "TexelDB API is running"}

@app.post("/encode/")
async def encode_file(file: UploadFile = File(...)):
    try:
        # Create a temporary directory to store the uploaded file and generated GIF
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save the uploaded file temporarily
            file_path = os.path.join(temp_dir, file.filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Change to temp directory for encoding
            original_cwd = os.getcwd()
            os.chdir(temp_dir)
            
            try:
                # Encode the file
                gif_name = texeldb.encode(file.filename)
                
                # Read the generated GIF and return it as a StreamingResponse
                with open(gif_name, "rb") as gif_file:
                    gif_content = gif_file.read()
                    
                return StreamingResponse(
                    io.BytesIO(gif_content), 
                    media_type="image/gif", 
                    headers={
                        "Content-Disposition": f"attachment; filename={gif_name}"
                    }
                )
            finally:
                os.chdir(original_cwd)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Encoding failed: {str(e)}")

@app.post("/decode/")
async def decode_file(file: UploadFile = File(...)):
    try:
        # Create a temporary directory to store the uploaded GIF and decoded file
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save the uploaded GIF temporarily
            gif_path = os.path.join(temp_dir, file.filename)
            with open(gif_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Change to temp directory for decoding
            original_cwd = os.getcwd()
            os.chdir(temp_dir)
            
            try:
                # Decode the GIF
                texeldb.decode(file.filename)

                # The decoded file will be saved in the current directory with "-recovered" in its name
                # We need to find this file and return it
                decoded_filename = ""
                for f in os.listdir("."):
                    if "-recovered" in f:
                        decoded_filename = f
                        break
                
                if decoded_filename:
                    with open(decoded_filename, "rb") as decoded_file:
                        decoded_content = decoded_file.read()
                        
                    return StreamingResponse(
                        io.BytesIO(decoded_content), 
                        media_type="application/octet-stream", 
                        headers={
                            "Content-Disposition": f"attachment; filename={decoded_filename}"
                        }
                    )
                else:
                    raise HTTPException(status_code=500, detail="Decoding failed: recovered file not found")
                    
            finally:
                os.chdir(original_cwd)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decoding failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

