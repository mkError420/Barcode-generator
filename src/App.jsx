import { useState, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import { Html5QrcodeScanner } from 'html5-qrcode'
import Quagga from 'quagga'
import './App.css'

function App() {
  const [productName, setProductName] = useState('')
  const [productId, setProductId] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [barcodeData, setBarcodeData] = useState(null)
  const [scannedProduct, setScannedProduct] = useState(null)
  const [activeTab, setActiveTab] = useState('generate')
  const [scanMode, setScanMode] = useState('camera')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [manualProductId, setManualProductId] = useState('')
  const canvasRef = useRef(null)

  const generateBarcode = () => {
    if (!productName || !productId || !productPrice) {
      alert('Please enter product name, product ID, and price')
      return
    }

    const data = `${productId}|${productName}|${productPrice}`
    setBarcodeData(data)
    
    setTimeout(() => {
      const canvas = document.getElementById('barcode-canvas')
      if (canvas) {
        JsBarcode(canvas, productId, {
          format: 'CODE39',
          lineColor: '#000000',
          width: 3,
          height: 100,
          displayValue: true,
          fontSize: 18,
          margin: 20,
          background: '#ffffff',
          font: 'monospace',
          textPosition: 'bottom'
        })
      }
    }, 100)
  }

  const downloadBarcode = () => {
    const canvas = document.getElementById('barcode-canvas')
    if (canvas) {
      // Create a high-resolution canvas
      const highResCanvas = document.createElement('canvas')
      const scale = 3 // 3x resolution for better quality
      highResCanvas.width = canvas.width * scale
      highResCanvas.height = canvas.height * scale
      
      const ctx = highResCanvas.getContext('2d')
      ctx.scale(scale, scale)
      
      // Draw white background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw the original canvas onto the high-res canvas
      ctx.drawImage(canvas, 0, 0)
      
      const link = document.createElement('a')
      link.download = `${productName.replace(/\s+/g, '_')}_barcode.png`
      link.href = highResCanvas.toDataURL('image/png', 1.0) // Maximum quality
      link.click()
    }
  }

  const printBarcode = () => {
    const canvas = document.getElementById('barcode-canvas')
    if (canvas) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print Barcode - ${productName}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .barcode-container {
              text-align: center;
            }
            .barcode-container img {
              max-width: 100%;
            }
            .product-info {
              margin-top: 20px;
              font-family: Arial, sans-serif;
              font-size: 14px;
            }
            .product-info p {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="barcode-container">
            <img src="${canvas.toDataURL('image/png')}" alt="Barcode" />
            <div class="product-info">
              <p><strong>Product Name:</strong> ${productName}</p>
              <p><strong>Product ID:</strong> ${productId}</p>
              <p><strong>Product Price:</strong> ${productPrice}</p>
            </div>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 300, height: 300 } },
      false
    )

    scanner.render(
      (decodedText) => {
        const product = products.find(p => p.id === decodedText)
        if (product) {
          setScannedProduct(product)
          scanner.clear()
        }
      },
      (errorMessage) => {
        // Handle scan errors silently
      }
    )
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageDataUrl = e.target.result
      setUploadedImage(imageDataUrl)

      try {
        // Use Quagga for barcode scanning from images
        Quagga.decodeSingle({
          src: imageDataUrl,
          numOfWorkers: 0,
          decoder: {
            readers: ["code_39_reader", "code_128_reader"]
          }
        }, function(result) {
          if (result && result.codeResult) {
            const decodedText = result.codeResult.code
            const product = products.find(p => p.id === decodedText)
            if (product) {
              setScannedProduct(product)
            } else {
              alert('Product not found with ID: ' + decodedText)
            }
          } else {
            alert('Could not decode barcode from image. Please try a clearer image or use the manual input option below.')
          }
        })
      } catch (err) {
        console.error('Error scanning file:', err)
        alert('Could not decode barcode from image. Please try a clearer image or use the manual input option below.')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleManualInput = () => {
    if (!manualProductId) {
      alert('Please enter a product ID')
      return
    }

    const product = products.find(p => p.id === manualProductId)
    if (product) {
      setScannedProduct(product)
    } else {
      alert('Product not found with ID: ' + manualProductId)
    }
  }

  const products = [
    { id: '12345', name: 'Sample Product 1', price: '$19.99' },
    { id: '67890', name: 'Sample Product 2', price: '$29.99' }
  ]

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="header">
          <h1>Barcode Generator</h1>
          <p>Create and scan barcodes with ease</p>
        </div>

        <div className="tab-buttons">
          <button
            onClick={() => setActiveTab('generate')}
            className={`tab-button ${activeTab === 'generate' ? 'active' : 'inactive'}`}
          >
            Generate Barcode
          </button>
        </div>

        {activeTab === 'generate' && (
          <div className="card">
            <div className="card-header">
              <div className="icon-box">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2>Generate New Barcode</h2>
            </div>
            
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
              />
            </div>

            <div className="form-group">
              <label>Product ID</label>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Enter product ID"
              />
            </div>

            <div className="form-group">
              <label>Product Price</label>
              <input
                type="text"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="Enter product price (e.g., ৳19.99)"
              />
            </div>

            <button onClick={generateBarcode} className="generate-button">
              Generate Barcode
            </button>

            {barcodeData && (
              <div className="barcode-result">
                <div className="barcode-header">
                  <h3>Generated Barcode</h3>
                  <div className="barcode-actions">
                    <button onClick={downloadBarcode} className="download-button">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                    <button onClick={printBarcode} className="print-button">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print
                    </button>
                  </div>
                </div>
                <div className="barcode-canvas-container">
                  <canvas id="barcode-canvas" ref={canvasRef}></canvas>
                </div>
                <div className="product-info">
                  <div className="info-box">
                    <p>Product Name</p>
                    <p>{productName}</p>
                  </div>
                  <div className="info-box">
                    <p>Product ID</p>
                    <p>{productId}</p>
                  </div>
                  <div className="info-box">
                    <p>Product Price</p>
                    <p>{productPrice}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'scan' && (
          <div className="card">
            <div className="card-header">
              <div className="icon-box">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2>Scan Barcode</h2>
            </div>
            
            <div className="scanner-section">
              <div className="scanner-tabs">
                <button
                  onClick={() => setScanMode('camera')}
                  className={`scanner-tab ${scanMode === 'camera' ? 'active' : ''}`}
                >
                  Camera Scan
                </button>
                <button
                  onClick={() => setScanMode('file')}
                  className={`scanner-tab ${scanMode === 'file' ? 'active' : ''}`}
                >
                  Image File
                </button>
              </div>

              {scanMode === 'camera' && (
                <div id="reader" className="scanner-container"></div>
              )}

              {scanMode === 'file' && (
                <div className="file-upload-section">
                  <div className="file-upload-box">
                    <input
                      type="file"
                      id="barcode-file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="file-input"
                    />
                    <label htmlFor="barcode-file" className="file-label">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Click to upload barcode image</span>
                      <span className="file-hint">or drag and drop</span>
                    </label>
                  </div>
                  {uploadedImage && (
                    <div className="uploaded-image-preview">
                      <img src={uploadedImage} alt="Uploaded barcode" />
                    </div>
                  )}
                  
                  <div className="manual-input-section">
                    <div className="manual-input-divider">
                      <span>OR</span>
                    </div>
                    <div className="manual-input-box">
                      <label>Enter Product ID Manually</label>
                      <div className="manual-input-group">
                        <input
                          type="text"
                          value={manualProductId}
                          onChange={(e) => setManualProductId(e.target.value)}
                          placeholder="Enter product ID (e.g., 12345)"
                        />
                        <button onClick={handleManualInput} className="manual-submit-button">
                          Search
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {scannedProduct && (
              <div className="scanned-result">
                <div className="scanned-header">
                  <div className="success-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3>Scanned Product Information</h3>
                </div>
                <div className="product-info">
                  <div className="info-box">
                    <p>Product ID</p>
                    <p>{scannedProduct.id}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="note-box">
              <p><strong>Note:</strong> For testing, use product IDs: 12345 or 67890</p>
            </div>
          </div>
        )}
        
        {/* Hidden div for file scanner */}
        <div id="file-scanner" style={{ display: 'none' }}></div>
      </div>
    </div>
  )
}

export default App
