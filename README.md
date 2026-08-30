# Tuition Fee Slip Generator - Trình Tạo Phiếu Học Phí Cao Cấp

Ứng dụng web giúp giáo viên/gia sư điểm danh, tính học phí và xuất ảnh **Phiếu Học Phí (Tuition Fee Slip)** chất lượng cao, tích hợp tạo mã QR ngân hàng tự động (VietQR).

---

## 📁 Cấu trúc thư mục (Directory Structure)

- **`frontend/`**: Ứng dụng React chạy trên Vite, Tailwind CSS v3, Lucide Icons, và `html-to-image` xuất ảnh độ phân giải cao.
- **`backend/`**: Server API (Node.js/Express) dự phòng nhằm mục đích hỗ trợ lưu trữ dữ liệu, lịch sử phiếu thu về sau.

---

## ⚡ Hướng dẫn cài đặt & Chạy ứng dụng

### 1. Khởi động Frontend (React + Vite)

Mở terminal và di chuyển vào thư mục `frontend`:
```bash
cd frontend
npm install
```

Chạy dự án ở chế độ phát triển (Development Mode):
```bash
npm run dev
```
Ứng dụng sẽ tự động mở trên trình duyệt tại địa chỉ: [http://localhost:3000](http://localhost:3000)

### 2. Khởi động Backend (Express API - Dự phòng)

Mở một cửa sổ terminal mới và di chuyển vào thư mục `backend`:
```bash
cd backend
npm install
```

Khởi động server API:
```bash
npm start
```
API sẽ hoạt động tại địa chỉ: [http://localhost:5000](http://localhost:5000)

---

## 🎨 Điểm nổi bật & Tính năng của Website
1. **Lập lịch tự động (Auto-scheduler):** Tự động điền danh sách ngày học trong tháng dựa trên các ngày cố định được tích chọn (Ví dụ: Thứ 2, Thứ 4, Thứ 6) giúp tiết kiệm 95% thời gian nhập tay của giáo viên.
2. **Tự động hóa VietQR:** Kết nối với hệ thống VietQR để tự điền đúng số tiền và nội dung chuyển khoản mẫu dạng `"Hoc phi T[Tháng] [Học sinh]"`. Phụ huynh chỉ cần quét bằng app ngân hàng là có thể chuyển khoản được ngay mà không lo nhầm số tiền hoặc số tài khoản.
3. **CORS Safe Image Export:** Ảnh QR được fetch chuyển thành Base64 động ở client-side, giải quyết triệt để lỗi "Canvas Tainted" khi chuyển đổi DOM thành file ảnh PNG bằng thư viện `html-to-image`.
4. **Hỗ trợ Đa giao diện:** Thiết kế sang trọng với 4 bộ tông màu pastel ngọt ngào, ấm cúng và dễ thương (Vườn hồng, Rừng xanh, Gió biển, Nắng chiều) phù hợp với nhiều môn học và sở thích của giáo viên.
5. **Hiệu ứng Confetti:** Pháo hoa chúc mừng bung nở rực rỡ khi xuất ảnh thành công, mang lại trải nghiệm thú vị cho giáo viên khi làm việc.
