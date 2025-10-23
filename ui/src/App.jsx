import { useState } from 'react';
import React from 'react';
import { Upload, FileText, CreditCard, Calendar, DollarSign, AlertCircle, CheckCircle, Loader2, Info, ExternalLink } from 'lucide-react';

const CreditCardParser = () => {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const SUPPORTED_ISSUERS = [
    'HDFC Bank',
    'ICICI Bank',
    'SBI Card',
    'Axis Bank',
    'Kotak Mahindra Bank'
  ];

  const API_URL = 'http://localhost:5000/api/parse';

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    if (uploadedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    setFile(uploadedFile);
    setError(null);
    setResult(null);
    setParsing(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse PDF');
      }
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to server. Make sure the Python backend is running on port 5000.');
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-pink-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-orange-600 to-red-600 rounded-2xl mb-4 shadow-lg">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Credit Card Statement Parser
          </h1>
          <p className="text-gray-600 text-lg">
            Python Backend + React Frontend
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Server Status: Make sure Flask is running on port 5000</span>
          </div>
        </div>

        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-3">📄 Where to Find Sample Credit Card Statements</h3>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="text-blue-700 underline text-sm font-medium mb-3 hover:text-blue-900"
              >
                {showInfo ? 'Hide' : 'Show'} detailed instructions
              </button>
              {showInfo && (
                <div className="space-y-4 text-sm text-blue-900">
                  <div className="bg-white/50 rounded-lg p-4">
                    <h4 className="font-bold mb-2">Option 1: Your Own Statements (Recommended)</h4>
                    <ul className="space-y-1 ml-4">
                      <li>• <strong>HDFC:</strong> NetBanking → Cards → View Statement → Download PDF</li>
                      <li>• <strong>ICICI:</strong> iMobile Pay app → Credit Card → Statement → Download</li>
                      <li>• <strong>SBI Card:</strong> sbicard.com → Login → My Account → Download Statement</li>
                      <li>• <strong>Axis:</strong> Internet Banking → Credit Cards → Statement → Generate PDF</li>
                      <li>• <strong>Kotak:</strong> Net Banking → Cards → Statement → Download</li>
                      <li>• <strong>Email:</strong> Check your registered email - banks send monthly statements</li>
                    </ul>
                  </div>
                  <div className="bg-white/50 rounded-lg p-4">
                    <h4 className="font-bold mb-2">Option 2: Sample/Demo Statements</h4>
                    <ul className="space-y-1 ml-4">
                      <li>• GitHub: Search "credit card statement sample pdf india"</li>
                      <li>• Kaggle: Credit card statement datasets</li>
                      <li>• Bank websites: Some have sample statement PDFs in help sections</li>
                    </ul>
                  </div>
                  <div className="bg-white/50 rounded-lg p-4">
                    <h4 className="font-bold mb-2">Option 3: Create Test Data</h4>
                    <p>For testing, you can create a simple PDF with text like:</p>
                    <div className="mt-2 p-3 bg-gray-800 text-green-400 rounded font-mono text-xs">
                      HDFC Bank Credit Card Statement<br/>
                      Card Number: XXXX XXXX XXXX 1234<br/>
                      Statement Period: 01/01/2024 to 31/01/2024<br/>
                      Payment Due Date: 15/02/2024<br/>
                      Total Amount Due: Rs. 15,450.00<br/>
                      <br/>
                      Transactions:<br/>
                      05/01/2024 AMAZON SHOPPING Rs. 2,500.00<br/>
                      10/01/2024 SWIGGY FOOD Rs. 850.00
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-amber-900 text-xs">
                      ⚠️ <strong>Privacy Note:</strong> Never share real statements publicly. Use your own for testing or create anonymized samples.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Supported Indian Banks
          </h2>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_ISSUERS.map((issuer) => (
              <span
                key={issuer}
                className="px-4 py-2 bg-linear-to-r from-orange-100 to-red-100 text-orange-800 rounded-full text-sm font-medium"
              >
                {issuer}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all duration-200"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-16 h-16 text-gray-400 mb-4" />
              <p className="mb-2 text-lg font-semibold text-gray-700">
                {file ? file.name : 'Click to upload PDF'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to select
              </p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6 mb-8 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {parsing && (
          <div className="bg-orange-50 border-l-4 border-orange-500 rounded-xl p-6 mb-8 flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
            <p className="text-orange-900 font-medium">Parsing your statement with Python backend...</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-orange-600" />
                Extracted Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-linear-to-br from-orange-50 to-red-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Card Issuer</p>
                      <p className="text-lg font-bold text-gray-900">{result.issuer}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Card Number</p>
                      <p className="text-lg font-bold text-gray-900">{result.cardNumber}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Billing Cycle</p>
                      <p className="text-lg font-bold text-gray-900">{result.billingCycle}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-linear-to-br from-yellow-50 to-orange-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Payment Due Date</p>
                      <p className="text-lg font-bold text-gray-900">{result.dueDate}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-linear-to-br from-red-50 to-pink-50 rounded-xl p-5 md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Balance Due</p>
                      <p className="text-2xl font-bold text-gray-900">{result.totalBalance}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {result.transactions && result.transactions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Recent Transactions (Sample)
                </h3>
                <div className="space-y-3">
                  {result.transactions.map((txn, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{txn.description}</p>
                        <p className="text-sm text-gray-500">{txn.date}</p>
                      </div>
                      <p className="font-bold text-gray-900 ml-4">{txn.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="mt-12 bg-gray-900 text-gray-100 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Setup Instructions
          </h3>
          <div className="space-y-3 text-sm font-mono">
            <p className="text-gray-400"># Install Python dependencies:</p>
            <p className="text-green-400">pip install flask flask-cors pdfplumber</p>
            <p className="text-gray-400 mt-4"># Run the Flask backend:</p>
            <p className="text-green-400">python app.py</p>
            <p className="text-gray-400 mt-4"># Then upload a PDF to test!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardParser;
