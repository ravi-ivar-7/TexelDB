import React, { useState } from 'react';
import { Upload, Download, FileText, Image, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEncoding, setIsEncoding] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [encodingResult, setEncodingResult] = useState(null);
  const [decodingResult, setDecodingResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setError(null);
    setEncodingResult(null);
    setDecodingResult(null);
  };

  const handleEncode = async () => {
    if (!selectedFile) {
      setError('Please select a file to encode');
      return;
    }

    setIsEncoding(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/encode/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Encoding failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const filename = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'encoded.gif';
      
      setEncodingResult({ url, filename });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsEncoding(false);
    }
  };

  const handleDecode = async () => {
    if (!selectedFile) {
      setError('Please select a GIF file to decode');
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.gif')) {
      setError('Please select a valid GIF file for decoding');
      return;
    }

    setIsDecoding(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/decode/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Decoding failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const filename = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'decoded-file';
      
      setDecodingResult({ url, filename });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDecoding(false);
    }
  };

  const downloadFile = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            TexelDB
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Convert any file to a GIF image and back. Store your data as pixels with our advanced encoding technology.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* File Upload Section */}
          <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload File
              </CardTitle>
              <CardDescription>
                Select any file to encode to GIF, or select a GIF file to decode back to its original format.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-muted-foreground
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-primary file:text-primary-foreground
                    hover:file:bg-primary/90 file:cursor-pointer
                    cursor-pointer"
                />
                {selectedFile && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Encode Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Encode to GIF
                </CardTitle>
                <CardDescription>
                  Convert your file into a GIF image where each pixel represents data bits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleEncode} 
                  disabled={!selectedFile || isEncoding}
                  className="w-full"
                  size="lg"
                >
                  {isEncoding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Encoding...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Encode File
                    </>
                  )}
                </Button>
                
                {encodingResult && (
                  <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      <div className="flex items-center justify-between">
                        <span>Encoding successful!</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(encodingResult.url, encodingResult.filename)}
                          className="ml-2"
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Download GIF
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Decode Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Decode from GIF
                </CardTitle>
                <CardDescription>
                  Convert a TexelDB GIF back to its original file format.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleDecode} 
                  disabled={!selectedFile || isDecoding}
                  className="w-full"
                  size="lg"
                  variant="secondary"
                >
                  {isDecoding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Decoding...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Decode GIF
                    </>
                  )}
                </Button>
                
                {decodingResult && (
                  <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      <div className="flex items-center justify-between">
                        <span>Decoding successful!</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(decodingResult.url, decodingResult.filename)}
                          className="ml-2"
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Download File
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* How it Works Section */}
          <Card>
            <CardHeader>
              <CardTitle>How TexelDB Works</CardTitle>
              <CardDescription>
                Understanding the encoding and decoding process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Encoding Process
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• File is converted to binary data</li>
                    <li>• Header with filename and size is added</li>
                    <li>• Each bit becomes a pixel (0=black, 1=white)</li>
                    <li>• Pixels are arranged in 4K resolution frames</li>
                    <li>• Frames are combined into a GIF animation</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Decoding Process
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• GIF is split into individual frames</li>
                    <li>• Each pixel is converted back to bits</li>
                    <li>• Header is decoded to get filename and size</li>
                    <li>• Binary data is reconstructed</li>
                    <li>• Original file is recovered perfectly</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;

