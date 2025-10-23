# 💳 Credit Card Statement Parser

A full-stack web app that extracts key details like **issuer, card number, billing cycle, due date, and total amount due** from Indian credit card statements (PDFs).  
Built with **Python (Flask)** for backend parsing and **React (Vite + Tailwind)** for a modern frontend.

---

## 🚀 Features
- Upload Indian credit card statements (HDFC, ICICI, SBI, Axis, Kotak)
- Extracts:
  - Bank / Issuer
  - Card Number (Last 4 digits)
  - Billing Period
  - Payment Due Date
  - Total Amount Due
- Displays data in a clean UI
- Local-only processing — your PDFs never leave your system

---

## ⚙️ Setup Guide

### 🐍 Backend (Flask)
```bash
cd server
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install flask flask-cors pdfplumber
python app.py
```
Server runs on → http://localhost:5000

⚛️ Frontend (React + Vite)
```bash
cd ui
npm install
npm run dev
```
App runs on → http://localhost:5173

## 🧾 How to Use

1. **Start** the Flask backend  
2. **Run** the React frontend  
3. **Upload** a credit card statement PDF  
4. **View** the extracted data instantly on screen  

---

## 🧠 Example Output

| Field | Value |
|-------|--------|
| **Issuer** | HDFC Bank |
| **Card Number** | Ending 1234 |
| **Billing Cycle** | 01-Sep-2024 → 30-Sep-2024 |
| **Due Date** | 15-Oct-2024 |
| **Total Due** | ₹12,540.00 |

---

## 🧩 Tech Stack

| Category | Technologies |
|-----------|--------------|
| **Frontend** | React, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Python, Flask, Flask-CORS, pdfplumber |
| **Language** | JavaScript, Python |
