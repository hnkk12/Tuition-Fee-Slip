import React from 'react';
import { computeTotalFee } from '../utils/fee';

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

const MOCK_QR_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%232C2A27'><rect width='100' height='100' fill='white'/><path d='M10 10h30v30H10zm5 5v20h20V15zm5 5h10v10H20zm40-10h30v30H60zm5 5v20h20V15zm5 5h10v10H70zM10 60h30v30H10zm5 5v20h20V65zm5 5h10v10H20zm30-20h10v10H50zm10 10h10v10H60zm10-10h10v10H70zm20 10h10v10H90zm-40 20h10v10H50zm20 0h10v10H70zm10-10h10v10H80zm10 20h10v10H90zm-20 10h10v10H70zm-10-10h10v10H60zm-20 0h10v10H40zm10 10h10v10H50zm30 0h10v10H80z'/></svg>`;

const ReceiptCard = React.forwardRef(({ data, sessions, theme, qrBase64 }, ref) => {
  const {
    className,
    periodMonth,
    periodYear,
    studentName,
    teacherName,
    teacherPhone,
    unitPrice,
    feeMode,
    totalHours,
    bankName,
    accountNumber,
    accountHolder,
    qrCodeType,
    customQrUrl,
    overviewNotes = [],
    subjectSections = [],
    footerNote
  } = data;

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';

  const attendedSessions = React.useMemo(
    () => sessions.filter(s => s.status === 'Học' || s.status === 'Bù'),
    [sessions]
  );
  const attendedSessionsCount = attendedSessions.length;

  const totalFee = React.useMemo(() => computeTotalFee(data, sessions), [data, sessions]);

  const monthNum = parseInt(periodMonth, 10) || 1;
  const activeQrSrc = qrCodeType === 'vietqr' ? (qrBase64 || MOCK_QR_SVG) : (customQrUrl || MOCK_QR_SVG);
  const bankLabel = POPULAR_BANKS.find(b => b.id === bankName)?.name.split(' (')[0] || bankName;

  const infoRows = [
    { label: 'Họ và tên', value: studentName },
    { label: 'Lớp', value: className },
    { label: 'Học phí', value: feeMode !== 'fixed' && unitPrice ? `${formatCurrency(unitPrice)}/buổi` : '' },
    { label: 'Buổi học', value: `${attendedSessionsCount} buổi` },
    { label: 'Giờ học', value: totalHours ? `${totalHours} giờ` : '' },
  ].filter(row => row.value);

  const visibleSubjectSections = subjectSections.filter(s => s.title && s.notes?.some(n => n));

  return (
    <div className="relative overflow-visible p-2">
      <div
        ref={ref}
        id="tuition-receipt"
        className="w-[480px] flex flex-col gap-4 p-6 rounded-[28px] border-[3px] shadow-[0_10px_35px_rgba(0,0,0,0.05)]"
        style={{
          fontFamily: '"Baloo 2", sans-serif',
          color: theme.headerText,
          backgroundColor: theme.bgCard,
          borderColor: theme.border,
        }}
      >
        {/* 1. Header: teacher name & phone (freeform, no fixed title prefix) */}
        <div className="flex justify-between items-center text-[14px] font-bold gap-2">
          <span className="truncate">{teacherName}</span>
          {teacherPhone && <span className="truncate shrink-0">SĐT. {teacherPhone}</span>}
        </div>

        {/* 2. Title */}
        <h1
          className="text-center text-[27px] font-extrabold uppercase leading-tight tracking-wide"
          style={{ color: theme.primary }}
        >
          Học Phí Tháng {monthNum}/{periodYear}
        </h1>

        {/* 3. Two info cards: student info + total/QR */}
        <div className="grid grid-cols-2 gap-3 items-stretch">
          {/* Student info card */}
          <div className="rounded-[20px] border-2 p-3.5 flex flex-col gap-2" style={{ borderColor: theme.border }}>
            <h2
              className="text-[13.5px] font-extrabold uppercase pb-1.5 border-b-2"
              style={{ color: theme.primary, borderColor: theme.border }}
            >
              Thông Tin Học Sinh
            </h2>
            <div className="flex flex-col gap-0.5">
              {infoRows.map((row, i) => (
                <div
                  key={i}
                  className="flex justify-between items-baseline gap-1 border-b border-dashed"
                  style={{ borderColor: theme.border }}
                >
                  <span className="text-[10.5px] font-semibold shrink-0" style={{ color: theme.headerSub }}>
                    {row.label}:
                  </span>
                  <span className="text-[12.5px] font-extrabold text-right truncate" style={{ color: theme.headerText }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            {attendedSessions.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-0.5">
                <span className="text-[10.5px] font-semibold" style={{ color: theme.headerSub }}>Ngày học:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {attendedSessions.map((s, idx) => (
                    <span
                      key={s.id || idx}
                      className="text-[10.5px] font-extrabold text-center rounded-full py-1 px-0.5 leading-none"
                      style={{ backgroundColor: theme.accent, color: theme.primary }}
                    >
                      {s.date}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Total fee + QR + bank info card */}
          <div className="rounded-[20px] border-2 p-3.5 flex flex-col items-center text-center gap-1.5" style={{ borderColor: theme.border }}>
            <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: theme.headerSub }}>
              Tổng Học Phí
            </span>
            <span className="text-[20px] font-extrabold leading-tight" style={{ color: theme.primary }}>
              {formatCurrency(totalFee)}
            </span>
            <div
              className="w-[120px] h-[120px] border-2 rounded-xl overflow-hidden flex items-center justify-center p-1 bg-white shrink-0"
              style={{ borderColor: theme.border }}
            >
              <img
                src={activeQrSrc}
                alt="Scan pay QR"
                className="w-full h-full object-contain mix-blend-multiply"
                crossOrigin="anonymous"
              />
            </div>
            {(bankName || accountNumber || accountHolder) && (
              <div className="flex flex-col gap-0.5 mt-0.5 w-full">
                {bankName && (
                  <span className="text-[11px] font-semibold break-words" style={{ color: theme.headerText }}>
                    Ngân hàng: {bankLabel}
                  </span>
                )}
                {accountNumber && (
                  <span className="text-[11px] font-semibold break-words" style={{ color: theme.headerText }}>
                    Số TK: {accountNumber}
                  </span>
                )}
                {accountHolder && (
                  <span className="text-[11px] font-semibold break-words" style={{ color: theme.headerText }}>
                    Chủ TK: {accountHolder}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4. Nhận xét học tập */}
        {(overviewNotes.some(Boolean) || visibleSubjectSections.length > 0) && (
          <div className="flex flex-col gap-2">
            <h2
              className="text-[15.5px] font-extrabold uppercase pb-1.5 border-b-2"
              style={{ color: theme.primary, borderColor: theme.border }}
            >
              Nhận Xét Học Tập
            </h2>
            {overviewNotes.some(Boolean) && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] font-extrabold" style={{ color: theme.primary }}>Tổng quan:</span>
                {overviewNotes.filter(Boolean).map((note, i) => (
                  <p key={i} className="text-[11.5px] font-medium leading-snug" style={{ color: theme.headerText }}>
                    + {note}
                  </p>
                ))}
              </div>
            )}
            {visibleSubjectSections.map((sec) => (
              <div key={sec.id} className="flex flex-col gap-0.5">
                <span className="text-[12px] font-extrabold" style={{ color: theme.primary }}>{sec.title}:</span>
                {sec.notes.filter(Boolean).map((note, i) => (
                  <p key={i} className="text-[11.5px] font-medium leading-snug" style={{ color: theme.headerText }}>
                    + {note}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* 5. Footer note */}
        {footerNote && (
          <div
            className="rounded-2xl py-2.5 px-2 text-center overflow-hidden"
            style={{ backgroundColor: theme.banner }}
          >
            <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: theme.primary }}>
              {footerNote}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

ReceiptCard.displayName = 'ReceiptCard';

export default ReceiptCard;
export { POPULAR_BANKS };
