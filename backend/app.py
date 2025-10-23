from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import re
from datetime import datetime
import io

app = Flask(__name__)
CORS(app)

SUPPORTED_ISSUERS = [
    'HDFC Bank',
    'ICICI Bank', 
    'SBI Card',
    'Axis Bank',
    'Kotak Mahindra Bank'
]

def detect_issuer(text):
    text_upper = text.upper()
    if 'HDFC BANK' in text_upper or 'HDFCBANK' in text_upper:
        return 'HDFC Bank'
    elif 'ICICI BANK' in text_upper or 'ICICIBANK' in text_upper:
        return 'ICICI Bank'
    elif 'SBI CARD' in text_upper or 'STATE BANK' in text_upper:
        return 'SBI Card'
    elif 'AXIS BANK' in text_upper or 'AXISBANK' in text_upper:
        return 'Axis Bank'
    elif 'KOTAK' in text_upper:
        return 'Kotak Mahindra Bank'
    return None

def extract_card_number(text, issuer):
    if issuer == 'HDFC Bank':
        patterns = [
            r'Card No[:\s]*(\d{4})\s+(\d{2})XX\s+XXXX\s+(\d{4})',
            r'(\d)\s+(\d)\s+(\d)\s+(\d)\s+(\d)\s+(\d)\s+(\d)\s+(\d)\s+X+\s+X+\s+(\d)\s+(\d)\s+(\d)\s+(\d)',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                groups = match.groups()
                if len(groups) == 3:
                    return groups[2]
                elif len(groups) == 12:
                    return ''.join(groups[8:12])
    elif issuer == 'Axis Bank':
        patterns = [
            r'(\d{6})\*{6}(\d{4})',
            r'Card No[.:\s]*(\d{6})\*{6}(\d{4})',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(2)
    elif issuer == 'ICICI Bank':
        patterns = [
            r'Card Number\s*:\s*(\d{4})\s+XXXX\s+XXXX\s+(\d{3,4})',
            r'(\d{4})\s+XXXX\s+XXXX\s+(\d{3,4})',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                last_digits = match.group(2)
                return last_digits.zfill(4)
    return "Not found"

def extract_billing_cycle(text, issuer):
    if issuer == 'HDFC Bank':
        patterns = [
            r'Statement Date[:\s]*(\d{2}/\d{2}/\d{4})',
            r'Statement for.*?(\d{2}/\d{2}/\d{4})',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
    elif issuer == 'Axis Bank':
        patterns = [
            r'Statement Period\s+Payment Due Date[^\n]*\n\s*(\d{2}/\d{2}/\d{4})\s*-\s*(\d{2}/\d{2}/\d{4})',
            r'Statement Period[:\s]+(\d{2}/\d{2}/\d{4})\s*-\s*(\d{2}/\d{2}/\d{4})',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                return f"{match.group(1)} to {match.group(2)}"
    elif issuer == 'ICICI Bank':
        patterns = [
            r'Statement Period\s*:\s*From\s+(\d{2}/\d{2}/\d{4})\s+to\s+(\d{2}/\d{2}/\d{4})',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return f"{match.group(1)} to {match.group(2)}"
    return "Not found"

def extract_due_date(text, issuer):
    if issuer == 'HDFC Bank':
        patterns = [
            r'Payment Due Date\s+Total Dues\s+Minimum Amount Due\s*\n\s*(\d{2}/\d{2}/\d{4})',
            r'Payment Due Date[:\s]*(\d{2}/\d{2}/\d{4})',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                return match.group(1)
    elif issuer == 'Axis Bank':
        patterns = [
            r'Statement Period\s+Payment Due Date\s+Statement Generation Date\s*\n\s*\d{2}/\d{2}/\d{4}\s*-\s*\d{2}/\d{2}/\d{4}\s+(\d{2}/\d{2}/\d{4})',
            r'Payment Due Date[:\s]+(\d{2}/\d{2}/\d{4})',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                return match.group(1)
    elif issuer == 'ICICI Bank':
        patterns = [
            r'Due Date\s*:\s*(\d{2}/\d{2}/\d{4})',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
    return "Not found"

def extract_total_balance(text, issuer):
    if issuer == 'HDFC Bank':
        patterns = [
            r'Payment Due Date\s+Total Dues\s+Minimum Amount Due\s*\n\s*\d{2}/\d{2}/\d{4}\s+([\d,]+\.?\d{0,2})',
            r'Total Dues\s*\n\s*([\d,]+\.?\d{0,2})',
            r'Total Dues[:\s]+([\d,]+\.?\d{0,2})',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                amount_str = match.group(1).replace(',', '')
                try:
                    amount = float(amount_str)
                    if 1.0 <= amount <= 100000000:
                        return f"₹{amount:,.2f}"
                except ValueError:
                    continue
    elif issuer == 'Axis Bank':
        patterns = [
            r'Total Payment Due\s+Minimum Payment Due\s+Statement Period[^\n]*\n\s*([\d,]+\.?\d{0,2})\s+Dr',
            r'Total Payment Due[:\s]+([\d,]+\.?\d{0,2})\s+Dr',
            r'=\s*Total Payment Due\s*\n[^\d]*([\d,]+\.?\d{0,2})\s+Dr',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                amount_str = match.group(1).replace(',', '')
                try:
                    amount = float(amount_str)
                    if 1.0 <= amount <= 100000000:
                        return f"₹{amount:,.2f}"
                except ValueError:
                    continue
    elif issuer == 'ICICI Bank':
        patterns = [
            r'Your Total Amount Due\s*[`₹]\s*([\d,]+\.?\d{0,2})',
            r'Your Total Amount Due\s*\n\s*[`₹]?\s*([\d,]+\.?\d{0,2})',
            r'Total Amount Due\s*:\s*[`₹]?\s*([\d,]+\.?\d{0,2})',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                amount_str = match.group(1).replace(',', '')
                try:
                    amount = float(amount_str)
                    if 0.01 <= amount <= 100000000:
                        return f"₹{amount:,.2f}"
                except ValueError:
                    continue
    return "Not found"

def extract_transactions(text, issuer):
    transactions = []
    lines = text.split('\n')
    if issuer == 'HDFC Bank':
        in_transactions = False
        for line in lines:
            if re.search(r'Domestic Transactions|Date\s+Transaction Description', line, re.IGNORECASE):
                in_transactions = True
                continue
            if re.search(r'Reward Points|International Transactions|For HDFC Bank|Page \d+', line, re.IGNORECASE):
                break
            if in_transactions:
                match = re.match(r'(\d{2}/\d{2}/\d{4})\s+(.+?)\s+([\d,]+\.?\d{0,2})(\s+Cr)?$', line.strip())
                if match:
                    date = match.group(1)
                    desc = match.group(2).strip()
                    amount_str = match.group(3)
                    is_credit = match.group(4) is not None
                    desc = re.sub(r'\(Ref#[^)]+\)', '', desc)
                    desc = re.sub(r'\s+', ' ', desc).strip()[:80]
                    if len(desc) > 5:
                        try:
                            amount = float(amount_str.replace(',', ''))
                            if 0.01 < amount < 10000000:
                                credit_marker = ' Cr' if is_credit else ''
                                transactions.append({
                                    'date': date,
                                    'description': desc,
                                    'amount': f"₹{amount:,.2f}{credit_marker}"
                                })
                        except ValueError:
                            continue
    elif issuer == 'Axis Bank':
        in_transactions = False
        for line in lines:
            if re.search(r'DATE\s+TRANSACTION DETAILS\s+MERCHANT CATEGORY\s+AMOUNT', line, re.IGNORECASE):
                in_transactions = True
                continue
            if re.search(r'\*{3,}\s*End of Statement|EMI BALANCES|CONTACT US', line, re.IGNORECASE):
                break
            if in_transactions:
                match = re.match(r'(\d{2}/\d{2}/\d{4})\s+(.+?)\s+([\d,]+\.?\d{0,2})\s+(Dr|Cr)', line.strip())
                if match:
                    date = match.group(1)
                    desc = match.group(2).strip()
                    amount_str = match.group(3)
                    is_credit = match.group(4) == 'Cr'
                    desc = re.sub(r'\s+(MISCELLANEOUS|ELECTRONICS|FUEL|Others|ENTERTAINMENT|MOBILE PHONES.*|CLOTH STORES|DEPT STORES|MEDICAL).*$', '', desc, flags=re.IGNORECASE)
                    desc = re.sub(r'\s+', ' ', desc).strip()[:80]
                    if len(desc) > 3:
                        try:
                            amount = float(amount_str.replace(',', ''))
                            if 0.01 < amount < 10000000:
                                credit_marker = ' Cr' if is_credit else ' Dr'
                                transactions.append({
                                    'date': date,
                                    'description': desc,
                                    'amount': f"₹{amount:,.2f}{credit_marker}"
                                })
                        except ValueError:
                            continue
    elif issuer == 'ICICI Bank':
        in_transactions = False
        for line in lines:
            if re.search(r'Date\s+Ref\.\s*Number\s+Transaction Details', line, re.IGNORECASE):
                in_transactions = True
                continue
            if re.search(r'Statement Period|Great offers|Safe Banking|State Code', line, re.IGNORECASE):
                break
            if in_transactions:
                match = re.match(r'(\d{2}/\d{2}/\d{4})\s+\d+\s+(.+?)\s+(?:IN|[\d.]+)\s+[\d.]+\s+[\d.]+\s+([\d,]+\.?\d*)\s*(CR)?', line.strip())
                if match:
                    date = match.group(1)
                    desc = match.group(2).strip()
                    amount_str = match.group(3)
                    is_credit = match.group(4) is not None
                    desc = re.sub(r'\s+', ' ', desc).strip()[:80]
                    if len(desc) > 5:
                        try:
                            amount = float(amount_str.replace(',', ''))
                            if 0.01 < amount < 10000000:
                                credit_marker = ' CR' if is_credit else ''
                                transactions.append({
                                    'date': date,
                                    'description': desc,
                                    'amount': f"₹{amount:,.2f}{credit_marker}"
                                })
                        except ValueError:
                            continue
    return transactions[:10]

@app.route('/api/parse', methods=['POST'])
def parse_statement():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are supported'}), 400
    try:
        pdf_bytes = file.read()
        pdf_file = io.BytesIO(pdf_bytes)
        full_text = ""
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"
        if not full_text.strip():
            return jsonify({'error': 'Could not extract text from PDF. It may be scanned or password-protected.'}), 400
        issuer = detect_issuer(full_text)
        if not issuer:
            return jsonify({'error': 'Could not detect card issuer. Supported banks: HDFC, ICICI, SBI Card, Axis, Kotak Mahindra'}), 400
        result = {
            'issuer': issuer,
            'cardNumber': extract_card_number(full_text, issuer),
            'billingCycle': extract_billing_cycle(full_text, issuer),
            'dueDate': extract_due_date(full_text, issuer),
            'totalBalance': extract_total_balance(full_text, issuer),
            'transactions': extract_transactions(full_text, issuer),
        }
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': f'Failed to parse PDF: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'supported_issuers': SUPPORTED_ISSUERS}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    app.run(host="0.0.0.0", port=port)
