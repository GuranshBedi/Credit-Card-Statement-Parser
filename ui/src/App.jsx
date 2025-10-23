import { useState } from "react";
import React from "react";
import {
  Upload,
  FileText,
  CreditCard,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  ExternalLink,
} from "lucide-react";

const CreditCardParser = () => {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  const SUPPORTED_ISSUERS = [
    "HDFC Bank",
    "ICICI Bank",
    "SBI Card",
    "Axis Bank",
    "Kotak Mahindra Bank",
  ];

  const API_URL = "http://localhost:5000/api/parse";

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    if (uploadedFile.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }
    setFile(uploadedFile);
    setError(null);
    setResult(null);
    setParsing(true);
    const formData = new FormData();
    formData.append("file", uploadedFile);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to parse PDF");
      }
      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Failed to connect to server. Make sure the Python backend is running on port 5000."
      );
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
                {file ? file.name : "Click to upload PDF"}
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
            <p className="text-orange-900 font-medium">
              Parsing your statement with Python backend...
            </p>
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
                      <p className="text-sm text-gray-600 font-medium">
                        Card Issuer
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {result.issuer}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Card Number
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {result.cardNumber}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Billing Cycle
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {result.billingCycle}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-linear-to-br from-yellow-50 to-orange-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Payment Due Date
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {result.dueDate}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-linear-to-br from-red-50 to-pink-50 rounded-xl p-5 md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Total Balance Due
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {result.totalBalance}
                      </p>
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
                        <p className="font-medium text-gray-900">
                          {txn.description}
                        </p>
                        <p className="text-sm text-gray-500">{txn.date}</p>
                      </div>
                      <p className="font-bold text-gray-900 ml-4">
                        {txn.amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditCardParser;
