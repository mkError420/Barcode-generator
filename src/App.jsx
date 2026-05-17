import { useState, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import { Html5QrcodeScanner } from 'html5-qrcode'
import './App.css'

function App() {
  const [productName, setProductName] = useState('')
  const [productId, setProductId] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [barcodeData, setBarcodeData] = useState(null)
  const [scannedProduct, setScannedProduct] = useState(null)
  const [activeTab, setActiveTab] = useState('generate')
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
          format: 'CODE128',
          lineColor: '#1e40af',
          width: 3,
          height: 120,
          displayValue: true,
          fontSize: 18,
          margin: 20,
          background: '#ffffff',
          font: 'monospace'
        })
      }
    }, 100)
  }

  const downloadBarcode = () => {
    const canvas = document.getElementById('barcode-canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = `${productName.replace(/\s+/g, '_')}_barcode.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
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
          <button
            onClick={() => {
              setActiveTab('scan')
              startScanner()
            }}
            className={`tab-button ${activeTab === 'scan' ? 'active' : 'inactive'}`}
          >
            Scan Barcode
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
                placeholder="Enter product price (e.g., $19.99)"
              />
            </div>

            <button onClick={generateBarcode} className="generate-button">
              Generate Barcode
            </button>

            {barcodeData && (
              <div className="barcode-result">
                <div className="barcode-header">
                  <h3>Generated Barcode</h3>
                  <button onClick={downloadBarcode} className="download-button">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
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
            
            <div id="reader" className="scanner-container"></div>

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
                    <p>Product Name</p>
                    <p>{scannedProduct.name}</p>
                  </div>
                  <div className="info-box">
                    <p>Product ID</p>
                    <p>{scannedProduct.id}</p>
                  </div>
                  <div className="info-box">
                    <p>Product Price</p>
                    <p>{scannedProduct.price}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="note-box">
              <p><strong>Note:</strong> For testing, use product IDs: 12345 or 67890</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
