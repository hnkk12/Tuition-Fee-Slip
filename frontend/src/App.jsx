import React, { useState, useEffect, useRef } from 'react';
import { toJpeg } from 'html-to-image';
import confetti from 'canvas-confetti';
import { Download, Sparkles, AlertCircle, RefreshCw, PenTool, Image, BookOpen } from 'lucide-react';
import ControlPanel from './components/ControlPanel';
import ReceiptCard from './components/ReceiptCard';

const THEMES = {
  eduBlue: {
    name: 'Xanh Học Đường (Mặc định)',
    primary: '#1F4E8C', // Editorial Blue
    primaryHover: '#163C6D',
    accent: '#EAF2FC',  // Light Blue pill/accent
    bgCard: '#FFFFFF',
    border: '#BFD7F5',
    banner: '#DCEAFC',
    headerText: '#16305A',
    headerSub: '#8496AE',
  },
  editorialTerracotta: {
    name: 'Đất Nung (Mặc định)',
    primary: '#C05C46', // Terracotta Red
    primaryHover: '#A34632',
    accent: '#FAF3E0',  // Warm Cream
    bgCard: '#FCFAF6',  // Warm Book Paper
    border: '#D8CBB5',
    banner: '#FAF3E0',
    headerText: '#2C2A27',
    headerSub: '#5C544B',
  },
  editorialOlive: {
    name: 'Lá Thảo Mộc (Editorial Olive)',
    primary: '#5B7053', // Sage Olive Green
    primaryHover: '#44543D',
    accent: '#F4EFEB',  // Light Beige
    bgCard: '#FCFAF6',
    border: '#D8CBB5',
    banner: '#F4EFEB',
    headerText: '#242D21',
    headerSub: '#545E50',
  },
  editorialNavy: {
    name: 'Hải Quân Cổ Điển (Vintage Navy)',
    primary: '#223E5B', // Deep Navy Blue
    primaryHover: '#172C42',
    accent: '#E3C18F',  // Vintage Gold
    bgCard: '#FCFAF6',
    border: '#C5B499',
    banner: '#E3C18F',
    headerText: '#101C29',
    headerSub: '#474D54',
  },
  editorialBurgundy: {
    name: 'Rượu Vang Đỏ (Editorial Burgundy)',
    primary: '#632B30', // Deep Burgundy Red
    primaryHover: '#4D2024',
    accent: '#E8DCC4',  // Rose Beige
    bgCard: '#FCFAF6',
    border: '#C5B499',
    banner: '#E8DCC4',
    headerText: '#2B1315',
    headerSub: '#5E5455',
  }
};

const DEFAULT_SESSIONS = [
  { id: '1', date: '04/08', status: 'Học' },
  { id: '2', date: '07/08', status: 'Học' },
  { id: '3', date: '09/08', status: 'Học' },
  { id: '4', date: '12/08', status: 'Học' },
  { id: '5', date: '13/08', status: 'Học' },
  { id: '6', date: '17/08', status: 'Học' },
  { id: '7', date: '18/08', status: 'Học' },
  { id: '8', date: '21/08', status: 'Học' },
  { id: '9', date: '24/08', status: 'Học' },
  { id: '10', date: '26/08', status: 'Học' },
  { id: '11', date: '28/08', status: 'Học' },
];

function App() {
  const [data, setData] = useState(() => {
    return {
      className: localStorage.getItem('ts_className') || 'Lớp 9',
      periodMonth: '08',
      periodYear: '2026',
      studentName: 'Duy Anh',
      teacherName: localStorage.getItem('ts_teacherName') || 'Nguyễn Thanh Thúy',
      teacherPhone: localStorage.getItem('ts_teacherPhone') || '0978783058',
      unitPrice: 120000,
      totalHours: '26.6',
      overviewNotes: [
        'Chưa chủ động trong quá trình học, thường xuyên thiếu BTVN, trong giờ học hay sao nhãng, nói chuyện riêng, không ôn bài về nhà.',
        'Trình bày bài chưa chỉn chu, làm ẩu.'
      ],
      subjectSections: [
        {
          id: 'sub-1',
          title: 'Đại số',
          notes: [
            'Tư duy số học tốt, nắm được cách giải hệ phương trình, bài toán liên quan.',
            'Thường xuyên sai các lỗi nhỏ vặt trong tính toán.'
          ]
        },
        {
          id: 'sub-2',
          title: 'Hình học',
          notes: [
            'Giải được các bài toán lượng giác cơ bản',
            'Cần ôn tập lại các kiến thức liên quan đến tam giác đồng dạng, song song, các đường đặc biệt trong tam giác.'
          ]
        }
      ],
      footerNote: 'Phụ huynh vui lòng kiểm tra thông tin học phí và lịch học. Cháu cảm ơn ạ.',
      bankName: localStorage.getItem('ts_bankName') || 'TCB',
      accountNumber: localStorage.getItem('ts_accountNumber') || '0978783058',
      accountHolder: localStorage.getItem('ts_accountHolder') || 'NGUYEN THANH THUY',
      qrCodeType: 'vietqr',
      customQrUrl: '',
    };
  });

  const [sessions, setSessions] = useState(DEFAULT_SESSIONS);
  const [selectedThemeKey, setSelectedThemeKey] = useState('eduBlue');
  const [qrBase64, setQrBase64] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [mobileView, setMobileView] = useState('editor'); // 'editor' | 'preview'



  // Persist teacher, class, and bank details in local storage for convenience
  useEffect(() => {
    localStorage.setItem('ts_className', data.className);
    localStorage.setItem('ts_teacherName', data.teacherName);
    localStorage.setItem('ts_teacherPhone', data.teacherPhone);
    localStorage.setItem('ts_bankName', data.bankName);
    localStorage.setItem('ts_accountNumber', data.accountNumber);
    localStorage.setItem('ts_accountHolder', data.accountHolder);
  }, [data.className, data.teacherName, data.teacherPhone, data.bankName, data.accountNumber, data.accountHolder]);

  const receiptRef = useRef(null);
  const currentTheme = THEMES[selectedThemeKey];

  // Fetch VietQR dynamically as Base64 to prevent CORS taint on canvas export
  useEffect(() => {
    const timer = setTimeout(() => {
      const attendedSessions = sessions.filter(s => s.status === 'Học' || s.status === 'Bù');
      const totalFee = attendedSessions.reduce((sum, s) => {
        const price = s.price !== undefined && s.price !== null ? s.price : data.unitPrice;
        return sum + price;
      }, 0);

      if (data.qrCodeType === 'vietqr' && data.bankName && data.accountNumber) {
        const amount = totalFee;
        const addInfo = `Hoc phi T${data.periodMonth} ${data.studentName}`;
        const accName = data.accountHolder;
        const url = `https://img.vietqr.io/image/${data.bankName}-${data.accountNumber}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accName)}`;

        fetch(url)
          .then(res => {
            if (!res.ok) throw new Error("Network response error");
            return res.blob();
          })
          .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => {
              setQrBase64(reader.result);
            };
            reader.readAsDataURL(blob);
          })
          .catch(err => {
            console.error("VietQR Fetch failed, falling back directly to URL:", err);
            setQrBase64(url); // Direct fallback
          });
      } else {
        setQrBase64('');
      }
    }, 400); // 400ms debounce to prevent API request flooding while typing

    return () => clearTimeout(timer);
  }, [
    data.qrCodeType,
    data.bankName,
    data.accountNumber,
    data.periodMonth,
    data.studentName,
    data.accountHolder,
    data.unitPrice,
    sessions
  ]);

  // Handle uploaded QR image conversion to Base64
  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({
          ...prev,
          customQrUrl: reader.result,
          qrCodeType: 'custom'
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Main Image Downloader (JPG format)
  const handleDownloadImage = async () => {
    const node = receiptRef.current;
    if (!node) return;

    setIsExporting(true);

    try {
      // html-to-image font loading bug fix:
      // Trigger rendering once to register fonts/images in browser cache, then capture.
      await toJpeg(node, { cacheBust: true, backgroundColor: currentTheme.bgCard });

      // Take high-DPI export
      const dataUrl = await toJpeg(node, {
        pixelRatio: 3, // crisp text on mobile/high-res screens
        cacheBust: true,
        backgroundColor: currentTheme.bgCard,
        style: {
          transform: 'scale(1)',
          borderRadius: '0px', // Export looks perfect on square constraints
        }
      });

      const fileName = `Phieu_Hoc_Phi_${data.studentName.trim().replace(/\s+/g, '_')}_T${data.periodMonth}_${data.periodYear}.jpg`;
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();

      // Confetti burst for awesome user feedback!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: [currentTheme.primary, currentTheme.accent, '#A8987E', '#D8CBB5']
      });

    } catch (error) {
      console.error('Lỗi khi tải ảnh:', error);
      alert('Không thể tạo file ảnh. Vui lòng thử lại hoặc chụp màn hình trực tiếp.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F4] flex flex-col font-sans selection:bg-[#FAF3E0] selection:text-slate-800">
      {/* 1. Editorial Header */}
      <header className="sticky top-0 bg-[#FCFAF6] border-b border-[#E0D4C3] px-5 py-4 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 border border-[#D8CBB5] rounded-xl flex items-center justify-center text-slate-850 shadow-sm"
              style={{ backgroundColor: currentTheme.accent }}
            >
              <BookOpen className="w-5 h-5 text-slate-700" />
            </div>
             <div>
               <h1 className="text-lg font-bold font-serif text-slate-800 tracking-tight leading-none">
                 The TUITION-FEE-SLIP
               </h1>
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                 Lập Phiếu Học Phí cho Giáo Viên
               </p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-white border border-[#D8CBB5] p-1.5 px-3.5 rounded-full shadow-sm">
              <AlertCircle className="w-3.5 h-3.5" style={{ color: currentTheme.primary }} />
              VIETQR CHUYỂN KHOẢN TỰ ĐỘNG
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main content area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Mobile View Switcher (Only visible below 'lg' screens) */}
        <div className="lg:hidden flex bg-[#FCFAF6] p-1 rounded-2xl border border-[#D8CBB5] gap-1">
          <button 
            onClick={() => setMobileView('editor')}
            className={`flex-1 py-2.5 text-xs font-bold font-serif rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              mobileView === 'editor' 
                ? 'bg-slate-850 text-white shadow-sm' 
                : 'text-slate-500'
            }`}
            style={mobileView === 'editor' ? { backgroundColor: currentTheme.primary } : {}}
          >
            <PenTool className="w-4 h-4" />
            Bút ký thông tin
          </button>
          <button 
            onClick={() => setMobileView('preview')}
            className={`flex-1 py-2.5 text-xs font-bold font-serif rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              mobileView === 'preview' 
                ? 'bg-slate-850 text-white shadow-sm' 
                : 'text-slate-500'
            }`}
            style={mobileView === 'preview' ? { backgroundColor: currentTheme.primary } : {}}
          >
            <Image className="w-4 h-4" />
            Xem trang báo cáo
          </button>
        </div>

        {/* Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Editor Panel */}
          <div className={`lg:col-span-7 xl:col-span-7 ${mobileView === 'editor' ? 'block' : 'hidden lg:block'}`}>
            <ControlPanel 
              data={data}
              setData={setData}
              sessions={sessions}
              setSessions={setSessions}
              themes={THEMES}
              selectedThemeKey={selectedThemeKey}
              setSelectedThemeKey={setSelectedThemeKey}
              handleQrUpload={handleQrUpload}
            />
          </div>

          {/* RIGHT: Live Preview & Download Button */}
          <div className={`lg:col-span-5 xl:col-span-5 flex flex-col items-center gap-6 lg:sticky lg:top-[100px] ${mobileView === 'preview' ? 'block' : 'hidden lg:block'}`}>
            
            {/* Action Bar (Editorial Card) */}
            <div className="w-full max-w-[440px] brutal-card p-4 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Hình thức xuất</span>
                <span className="text-xs font-bold text-slate-700">TẬP TIN JPG CHẤT LƯỢNG CAO</span>
              </div>
              
              <button 
                onClick={handleDownloadImage}
                disabled={isExporting}
                className="brutal-button px-5 py-3 text-xs flex items-center gap-2"
                style={{ 
                  backgroundColor: currentTheme.primary,
                }}
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Đang tạo trang...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-white" />
                    Tải trang ký (JPG)
                  </>
                )}
              </button>
            </div>

            {/* Live Slip Preview Wrapper (Paper Card Frame) */}
            <div className="brutal-card p-5 max-w-full overflow-x-auto flex justify-center bg-[#FCFAF6] border border-[#E0D4C3] shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
              <ReceiptCard 
                ref={receiptRef}
                data={data}
                sessions={sessions}
                theme={currentTheme}
                qrBase64={qrBase64}
              />
            </div>
            
            {/* Quick Helper Tips */}
            <div className="max-w-[440px] brutal-card p-4 text-center text-[10.5px] font-medium bg-[#FAF3E0]/70 text-slate-650 leading-relaxed">
              📝 <strong>Lời khuyên:</strong> Trang bút ký lưu dưới định dạng ảnh JPG sắc nét, dễ dàng chuyển tiếp cho gia đình qua Zalo/Viber. Cột thanh toán giúp đối soát nhanh trong 3 giây.
            </div>

          </div>

        </div>
      </main>

      {/* 3. Footer */}
      <footer className="bg-[#FCFAF6] border-t border-[#E0D4C3] py-5 px-4 text-center mt-auto text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <span>© 2026 The Diary Slip. Phong cách thiết kế Storytelling & Editorial.</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] tracking-wide">DỮ LIỆU ĐƯỢC MÃ HÓA AN TOÀN TRÊN TRÌNH DUYỆT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
