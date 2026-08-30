import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and parsing of JSON request body
app.use(cors());
app.use(express.json());

// In-memory data store for receipts
let receiptsDb = [
  {
    id: 'sample-1',
    className: 'Lớp Toán 10A1',
    periodMonth: '05',
    periodYear: '2026',
    studentName: 'Nguyễn Minh An',
    teacherName: 'Cô Hằng',
    unitPrice: 150000,
    feedback: 'Bé An tiếp thu bài nhanh, làm bài tập đầy đủ. Phần hình học không gian cần chú ý vẽ hình chính xác hơn.',
    bankName: 'MB',
    accountNumber: '0987654321',
    accountHolder: 'NGUYEN THI HANG',
    qrCodeType: 'vietqr',
    sessions: [
      { id: '1', date: '04/05', status: 'Có mặt' },
      { id: '2', date: '06/05', status: 'Có mặt' },
      { id: '3', date: '11/05', status: 'Vắng' },
      { id: '4', date: '13/05', status: 'Có mặt' },
      { id: '5', date: '18/05', status: 'Có mặt' },
      { id: '6', date: '20/05', status: 'Có phép' },
      { id: '7', date: '25/05', status: 'Có mặt' },
      { id: '8', date: '27/05', status: 'Có mặt' },
    ]
  }
];

// 1. Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running perfectly.' });
});

// 2. Fetch all saved receipts
app.get('/api/receipts', (req, res) => {
  try {
    res.json({ success: true, count: receiptsDb.length, data: receiptsDb });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Save a new receipt
app.post('/api/receipts', (req, res) => {
  try {
    const newReceipt = req.body;
    
    // Add simple validation
    if (!newReceipt.studentName || !newReceipt.className) {
      return res.status(400).json({ 
        success: false, 
        message: 'studentName and className are required fields.' 
      });
    }

    // Assign a unique ID
    newReceipt.id = `receipt-${Date.now()}`;
    newReceipt.createdAt = new Date().toISOString();
    
    receiptsDb.unshift(newReceipt); // Add to the beginning of the array

    res.status(201).json({
      success: true,
      message: 'Receipt saved successfully.',
      data: newReceipt
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Delete a receipt
app.delete('/api/receipts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = receiptsDb.length;
    receiptsDb = receiptsDb.filter(r => r.id !== id);
    
    if (receiptsDb.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Receipt not found.' });
    }
    
    res.json({ success: true, message: 'Receipt deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  Tuition Fee Slip Backend active on port ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  API Receipts: http://localhost:${PORT}/api/receipts`);
  console.log(`==================================================`);
});
