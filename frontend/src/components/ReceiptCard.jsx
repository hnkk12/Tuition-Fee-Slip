import React from 'react';
import { Heart, CloudRain, Leaf } from 'lucide-react';

const POPULAR_BANKS = [
  { id: 'MB', name: 'MB Bank (Quân Đội)', bin: '970422' },
  { id: 'VCB', name: 'Vietcombank (Ngoại Thương)', bin: '970436' },
  { id: 'TCB', name: 'Techcombank (Kỹ Thương)', bin: '970407' },
  { id: 'BIDV', name: 'BIDV (Đầu tư & Phát triển)', bin: '970418' },
  { id: 'CTG', name: 'VietinBank (Công Thương)', bin: '970415' },
  { id: 'ACB', name: 'ACB (Á Châu)', bin: '970416' },
  { id: 'TPB', name: 'TPBank (Tiên Phong)', bin: '970423' },
  { id: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)', bin: '970432' },
  { id: 'VIB', name: 'VIB (Quốc Tế)', bin: '970441' },
  { id: 'STB', name: 'Sacombank (Sài Gòn Thương Tín)', bin: '970403' },
  { id: 'VBA', name: 'Agribank (Nông nghiệp & PTNT)', bin: '970405' },
  { id: 'HDB', name: 'HDBank (Phát triển TP.HCM)', bin: '970437' },
  { id: 'SHB', name: 'SHB (Sài Gòn - Hà Nội)', bin: '970443' }
];

const splitStudentName = (name = '') => {
  const trimmed = name.trim();
  if (!trimmed) return { hoDem: 'Học sinh', tenChinh: '' };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { hoDem: '', tenChinh: parts[0] };
  }
  const tenChinh = parts[parts.length - 1];
  const hoDem = parts.slice(0, -1).join(' ');
  return { hoDem, tenChinh };
};

const MOCK_QR_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%232C2A27'><rect width='100' height='100' fill='white'/><path d='M10 10h30v30H10zm5 5v20h20V15zm5 5h10v10H20zm40-10h30v30H60zm5 5v20h20V15zm5 5h10v10H70zM10 60h30v30H10zm5 5v20h20V65zm5 5h10v10H20zm30-20h10v10H50zm10 10h10v10H60zm10-10h10v10H70zm20 10h10v10H90zm-40 20h10v10H50zm20 0h10v10H70zm10-10h10v10H80zm10 20h10v10H90zm-20 10h10v10H70zm-10-10h10v10H60zm-20 0h10v10H40zm10 10h10v10H50zm30 0h10v10H80z'/></svg>`;

const ReceiptCard = React.forwardRef(({ data, sessions, theme, qrBase64 }, ref) => {
  const {
    className,
    periodMonth,
    periodYear,
    studentName,
    teacherName,
    unitPrice,
    feedback,
    bankName,
    accountNumber,
    accountHolder,
    qrCodeType,
    customQrUrl
  } = data;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  const attendedSessions = React.useMemo(() => {
    return sessions.filter(s => s.status === 'Học' || s.status === 'Bù');
  }, [sessions]);

  const attendedSessionsCount = attendedSessions.length;

  const totalFee = React.useMemo(() => {
    return attendedSessions.reduce((sum, s) => {
      const price = s.price !== undefined && s.price !== null ? s.price : unitPrice;
      return sum + price;
    }, 0);
  }, [attendedSessions, unitPrice]);

  const footnoteText = React.useMemo(() => {
    if (attendedSessions.length === 0) {
      return `0 buổi × ${formatCurrency(unitPrice)}`;
    }
    const rateGroups = {};
    attendedSessions.forEach(s => {
      const price = s.price !== undefined && s.price !== null ? s.price : unitPrice;
      rateGroups[price] = (rateGroups[price] || 0) + 1;
    });
    const sortedPrices = Object.keys(rateGroups).map(Number).sort((a, b) => a - b);
    const parts = sortedPrices.map(price => {
      const count = rateGroups[price];
      return `${count} buổi × ${formatCurrency(price)}`;
    });
    return `${parts.join(' & ')}`;
  }, [attendedSessions, unitPrice]);

  const { hoDem, tenChinh } = splitStudentName(studentName);
  const monthNum = parseInt(periodMonth, 10) || 4;

  const activeQrSrc = qrCodeType === 'vietqr' ? (qrBase64 || MOCK_QR_SVG) : (customQrUrl || MOCK_QR_SVG);

  return (
    <div className="relative overflow-visible p-2">
      {/* Target receipt slip for export (Unified single page - A6 Size: 380px x 538px) */}
      <div
        ref={ref}
        id="tuition-receipt"
        className="w-[380px] h-[538px] border-4 border-[#E0D4C3] border-double flex flex-col justify-between p-4 shadow-[0_10px_35px_rgba(0,0,0,0.04)] transition-all duration-300 bg-[#FCFAF6]"
        style={{
          color: theme.headerText,
          backgroundColor: theme.bgCard
        }}
      >
        {/* 1. Header (Top) */}
        <div className="flex flex-col items-center text-center w-full gap-1">
          <span
            className="text-2xl font-black tracking-tight uppercase leading-tight"
            style={{ color: theme.primary }}
          >
            Phiếu Học Phí Tháng {monthNum}
          </span>
          <span className="text-[13px] font-black uppercase tracking-wider" style={{ color: theme.primary }}>
            Năm {periodYear || '2026'}
          </span>
          {className && (
            <span className="text-[13px] font-bold truncate max-w-full" style={{ color: theme.headerText }}>
              {className}
            </span>
          )}
        </div>

        <div className="w-full h-[1px] bg-[#E0D4C3]/80" />

        {/* 2. Student Info Protagonist Bar */}
        <div className="flex items-center justify-between bg-white border border-[#D8CBB5] rounded-xl px-3 py-2 shadow-sm">
          <div className="flex flex-col min-w-0 flex-1 pr-2">
            <span className="text-[9px] font-medium uppercase text-slate-400 tracking-wider">Học sinh</span>
            <div className="text-[17px] font-black tracking-tight leading-normal mt-0.5 ml-2 truncate">
              <span style={{ color: theme.primary }}>{hoDem}</span>
              {tenChinh && (
                <span className="font-black ml-1.5" style={{ color: theme.primary }}>
                  {tenChinh}
                </span>
              )}
            </div>
          </div>
          <span
            className="text-[10px] font-bold shrink-0 whitespace-nowrap"
            style={{ color: theme.primary }}
          >
            Số buổi: {attendedSessionsCount}
          </span>
        </div>

        {/* 3. Attendance Section */}
        <div className="flex flex-col gap-1 items-center text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
              Điểm danh ({sessions.length})
            </span>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-2 text-[10px] text-slate-400 bg-white/40 border border-[#D8CBB5] rounded-xl w-full">
              Chưa có thông tin điểm danh.
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-1 max-h-[105px] overflow-hidden pr-0.5">
              {sessions.map((session, idx) => {
                let statusBg = 'bg-slate-50 text-slate-600 border-[#D8CBB5]';
                let icon = null;

                if (session.status === 'Học') {
                  statusBg = 'bg-rose-50 text-rose-800 border-rose-200';
                  icon = <Heart className="w-2.5 h-2.5 fill-current text-rose-500 shrink-0" style={{ color: theme.primary }} />;
                } else if (session.status === 'Nghỉ') {
                  statusBg = 'bg-slate-100 text-slate-600 border-slate-300';
                  icon = <CloudRain className="w-2.5 h-2.5 text-slate-400 shrink-0" />;
                } else if (session.status === 'Bù') {
                  statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-250';
                  icon = <Leaf className="w-2.5 h-2.5 text-emerald-500 shrink-0" />;
                }

                const formatShortPrice = (val) => val % 1000 === 0 ? `${val / 1000}k` : val;

                return (
                  <div 
                    key={session.id || idx}
                    className={`flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold border rounded-lg shadow-sm ${statusBg}`}
                  >
                    <span>{session.date}</span>
                    <span>•</span>
                    <span className="text-[8.5px] uppercase tracking-wide">
                      {session.status}
                      {session.price !== undefined && session.price !== null && ` (${formatShortPrice(session.price)})`}
                    </span>
                    {icon}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Teacher Feedback (if any) */}
        {feedback ? (
          <div className="relative pl-3 border-l-2 py-0.5" style={{ borderColor: theme.primary }}>
            <span className="absolute -top-3 left-1 text-xl leading-none opacity-20 select-none" style={{ color: theme.primary }}>❝</span>
            <p className="text-[10px] font-bold italic leading-normal text-slate-700 break-words line-clamp-3">
              {feedback}
            </p>
          </div>
        ) : (
          <div className="h-0" />
        )}

        {/* 5. Total Fee Banner (Compact Horizontal layout) */}
        <div 
          className="rounded-xl p-2.5 border border-[#D8CBB5] flex justify-between items-center shadow-sm"
          style={{ backgroundColor: theme.banner }}
        >
          <div className="flex flex-col gap-0.5 text-left min-w-0 flex-1 pr-2">
            <span className="text-[9.5px] font-bold tracking-wider uppercase text-slate-500" style={{ color: theme.headerSub }}>
              🏷️ TỔNG KẾT HỌC PHÍ
            </span>
            <span className="text-[8.5px] font-bold opacity-80 truncate" style={{ color: theme.headerSub }}>
              {footnoteText}
            </span>
          </div>
          <span className="text-2xl font-bold tracking-tight leading-none shrink-0" style={{ color: theme.primary }}>
            {formatCurrency(totalFee)}
          </span>
        </div>

        {/* 6. Centered QR Code & Bank Transfer Details at the Bottom */}
        <div className="flex flex-col gap-1.5 border-t border-[#E0D4C3] pt-2 mt-0.5">
          {(bankName || accountNumber || accountHolder) && (
            <span
              className="text-[19px] font-bold uppercase text-slate-700 tracking-wide leading-tight text-center whitespace-nowrap"
              style={{ fontFamily: '"Montserrat", sans-serif' }}
            >
              Thông tin thanh toán
            </span>
          )}
          <div className="flex items-center gap-3">
            {/* QR Code Container */}
            <div className="w-[110px] h-[110px] border border-[#D8CBB5] rounded-xl overflow-hidden flex items-center justify-center p-1 bg-white shadow-sm shrink-0">
              <img
                src={activeQrSrc}
                alt="Scan pay QR"
                className="w-full h-full object-contain mix-blend-multiply"
                crossOrigin="anonymous"
              />
            </div>

            {/* Simple Account Info Lines */}
            {(bankName || accountNumber || accountHolder) && (
              <div className="flex flex-col items-start text-left w-full min-w-0 flex-1 gap-0.5" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                <span className="text-[11px] font-bold tracking-wide text-slate-700 truncate leading-tight">
                  Ngân hàng: {POPULAR_BANKS.find(b => b.id === bankName)?.name.split(' (')[0] || bankName}
                </span>
                <span className="text-[10.5px] font-bold tracking-wide text-slate-800 leading-tight break-words">
                  Số tài khoản: {accountNumber} ({accountHolder})
                </span>
                <span className="text-[8.5px] font-bold tracking-wide leading-tight text-rose-600 border-t border-slate-100 pt-1.5 mt-1.5 max-w-[195px] block">
                  Lưu ý: Không chuyển tiền nếu QR sai Tên người nhận hoặc STK
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
});

ReceiptCard.displayName = 'ReceiptCard';

export default ReceiptCard;
export { POPULAR_BANKS };
