import React, { useState, useEffect } from 'react';
import { POPULAR_BANKS } from './ReceiptCard';
import {
  User,
  BookOpen,
  Calendar,
  DollarSign,
  CreditCard,
  Plus,
  Trash2,
  Check,
  QrCode,
  Upload,
  Layers,
  Clock,
  Sparkles,
  MessageSquare,
  Phone
} from 'lucide-react';

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const ControlPanel = ({ 
  data, 
  setData, 
  sessions, 
  setSessions, 
  themes, 
  selectedThemeKey, 
  setSelectedThemeKey, 
  handleQrUpload
}) => {
  const [activeTab, setActiveTab] = useState('student');
  const [showAutoSchedule, setShowAutoSchedule] = useState(false);
  const [selectedDays, setSelectedDays] = useState([1, 3, 5]); // Default Mon, Wed, Fri (1, 3, 5)

  const activeTheme = themes[selectedThemeKey];

  // Quick state update helper
  const handleChange = (field, value) => {
    setData(prev => {
      let updatedValue = value;
      // Automatically capitalize account holder name
      if (field === 'accountHolder') {
        updatedValue = value.toUpperCase();
      }
      return { ...prev, [field]: updatedValue };
    });
  };

  // --- Simple string-array field helpers (overviewNotes) ---
  const handleArrayItemChange = (field, index, value) => {
    setData(prev => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const handleAddArrayItem = (field, value = '') => {
    setData(prev => ({ ...prev, [field]: [...prev[field], value] }));
  };

  const handleRemoveArrayItem = (field, index) => {
    setData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  // --- Subject sections helpers (nested notes list per subject) ---
  const handleSubjectTitleChange = (id, title) => {
    setData(prev => ({
      ...prev,
      subjectSections: prev.subjectSections.map(s => (s.id === id ? { ...s, title } : s))
    }));
  };

  const handleSubjectNoteChange = (id, noteIdx, value) => {
    setData(prev => ({
      ...prev,
      subjectSections: prev.subjectSections.map(s =>
        s.id === id ? { ...s, notes: s.notes.map((n, i) => (i === noteIdx ? value : n)) } : s
      )
    }));
  };

  const handleAddSubjectNote = (id) => {
    setData(prev => ({
      ...prev,
      subjectSections: prev.subjectSections.map(s => (s.id === id ? { ...s, notes: [...s.notes, ''] } : s))
    }));
  };

  const handleRemoveSubjectNote = (id, noteIdx) => {
    setData(prev => ({
      ...prev,
      subjectSections: prev.subjectSections.map(s =>
        s.id === id ? { ...s, notes: s.notes.filter((_, i) => i !== noteIdx) } : s
      )
    }));
  };

  const handleAddSubject = () => {
    setData(prev => ({
      ...prev,
      subjectSections: [...prev.subjectSections, { id: genId(), title: '', notes: [''] }]
    }));
  };

  const handleRemoveSubject = (id) => {
    setData(prev => ({ ...prev, subjectSections: prev.subjectSections.filter(s => s.id !== id) }));
  };

  // Local QR upload handler
  const handleLocalQrUpload = (e) => {
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

  // Add a single session
  const handleAddSession = () => {
    let nextDateStr = '';
    if (sessions.length > 0) {
      const lastSession = sessions[sessions.length - 1];
      const match = lastSession.date.match(/^(\d{2})\/(\d{2})$/);
      if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(data.periodYear, 10) || new Date().getFullYear();
        
        const tempDate = new Date(year, month - 1, day);
        tempDate.setDate(tempDate.getDate() + 2); // Default offset is 2 days
        
        const nextDay = String(tempDate.getDate()).padStart(2, '0');
        const nextMonth = String(tempDate.getMonth() + 1).padStart(2, '0');
        nextDateStr = `${nextDay}/${nextMonth}`;
      }
    }
    
    if (!nextDateStr) {
      const date = new Date();
      nextDateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    setSessions(prev => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        date: nextDateStr,
        status: 'Học',
        price: undefined
      }
    ]);
  };

  // Remove a session
  const handleRemoveSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  // Update specific session date or status
  const handleUpdateSession = (id, field, value) => {
    setSessions(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  // Mark all sessions present
  const handleMarkAllPresent = () => {
    setSessions(prev => prev.map(s => ({ ...s, status: 'Học' })));
  };

  // Delete all sessions
  const handleClearSessions = () => {
    setSessions([]);
  };

  // Auto generate sessions based on days of the week in current month
  const handleGenerateWeeklySessions = () => {
    const month = parseInt(data.periodMonth, 10);
    const year = parseInt(data.periodYear, 10);
    if (isNaN(month) || isNaN(year) || selectedDays.length === 0) return;

    const generated = [];
    const date = new Date(year, month - 1, 1);

    while (date.getMonth() === month - 1) {
      const day = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      if (selectedDays.includes(day)) {
        const dayStr = String(date.getDate()).padStart(2, '0');
        const monthStr = String(date.getMonth() + 1).padStart(2, '0');
        generated.push({
          id: `${date.getTime()}-${Math.random().toString(36).substr(2, 5)}`,
          date: `${dayStr}/${monthStr}`,
          status: 'Học',
          price: undefined
        });
      }
      date.setDate(date.getDate() + 1);
    }
    
    setSessions(generated);
    setShowAutoSchedule(false);
  };

  // Handle Day selection for Auto Generator
  const toggleDaySelection = (dayNum) => {
    setSelectedDays(prev => 
      prev.includes(dayNum) 
        ? prev.filter(d => d !== dayNum) 
        : [...prev, dayNum].sort()
    );
  };

  return (
    <div className="brutal-card p-5 lg:p-6 bg-[#FCFAF6] flex flex-col gap-6">
      {/* Panel Headers */}
      <div>
        <h2 className="text-xl font-bold font-serif text-slate-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-slate-500" style={{ fill: activeTheme.primary, color: 'transparent' }} />
          Phiếu Học Phí
        </h2>
        <p className="text-xs text-slate-500 font-bold mt-1">
          Chỉnh sửa các ghi chép học tập, thiết kế trang báo cáo của tháng và kết xuất.
        </p>
      </div>

      {/* Editorial Tab Bar */}
      <div className="flex flex-wrap md:flex-nowrap bg-[#F4EFEB] p-1 rounded-2xl text-[11px] font-bold gap-1 border border-[#D8CBB5]">
        <button 
          onClick={() => setActiveTab('student')}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1 transition-all font-serif ${
            activeTab === 'student' 
              ? 'bg-white text-slate-800 shadow-sm border border-[#D8CBB5]' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          HỌC VIÊN
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1 transition-all font-serif ${
            activeTab === 'sessions'
              ? 'bg-white text-slate-800 shadow-sm border border-[#D8CBB5]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          NHẬT KÝ ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1 transition-all font-serif ${
            activeTab === 'notes'
              ? 'bg-white text-slate-800 shadow-sm border border-[#D8CBB5]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          NHẬN XÉT
        </button>
        <button
          onClick={() => setActiveTab('payment')}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1 transition-all font-serif ${
            activeTab === 'payment' 
              ? 'bg-white text-slate-800 shadow-sm border border-[#D8CBB5]' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          NGÂN HÀNG
        </button>
        <button 
          onClick={() => setActiveTab('theme')}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1 transition-all font-serif ${
            activeTab === 'theme' 
              ? 'bg-white text-slate-800 shadow-sm border border-[#D8CBB5]' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          ĐỒ HỌA
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto pr-1 max-h-[500px]">
        {/* TAB 1: Student & Class Info */}
        {activeTab === 'student' && (
          <div className="flex flex-col gap-4.5 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-655 font-serif">Tên Lớp Học</label>
                <input 
                  type="text" 
                  value={data.className} 
                  onChange={(e) => handleChange('className', e.target.value)}
                  placeholder="Toán 10A1"
                  className="brutal-input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-655 font-serif">Người Hướng Dẫn / Giáo Viên</label>
                <input
                  type="text"
                  value={data.teacherName}
                  onChange={(e) => handleChange('teacherName', e.target.value)}
                  placeholder="Cô Hằng"
                  className="brutal-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-655 font-serif">Số Điện Thoại Giáo Viên</label>
                <div className="relative">
                  <input
                    type="text"
                    value={data.teacherPhone}
                    onChange={(e) => handleChange('teacherPhone', e.target.value)}
                    placeholder="0978783058"
                    className="brutal-input w-full pl-9 font-mono"
                  />
                  <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-655 font-serif">Tổng Số Giờ Học</label>
                <input
                  type="text"
                  value={data.totalHours}
                  onChange={(e) => handleChange('totalHours', e.target.value)}
                  placeholder="26.6"
                  className="brutal-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-655 font-serif">Học Viên Chính</label>
                <input
                  type="text"
                  value={data.studentName}
                  onChange={(e) => handleChange('studentName', e.target.value)}
                  placeholder="Nguyễn Minh An"
                  className="brutal-input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-655 font-serif">Tháng Biên Soạn</label>
                <select 
                  value={data.periodMonth} 
                  onChange={(e) => handleChange('periodMonth', e.target.value)}
                  className="brutal-input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%239C8E79%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[right_12px_center] bg-no-repeat font-serif"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = String(i + 1).padStart(2, '0');
                    return <option key={m} value={m}>Tháng {m}</option>;
                  })}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-655 font-serif">Năm Biên Soạn</label>
                <input 
                  type="number" 
                  value={data.periodYear} 
                  onChange={(e) => handleChange('periodYear', e.target.value)}
                  placeholder="2026"
                  className="brutal-input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-655 font-serif">Chi Phí Mỗi Buổi Học (VNĐ)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={data.unitPrice} 
                  onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value) || 0)}
                  placeholder="150000"
                  step="10000"
                  className="brutal-input w-full pl-9 font-mono"
                />
                <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Attendance & Sessions */}
        {activeTab === 'sessions' && (
          <div className="flex flex-col gap-4.5 animate-fade-in">
            {/* Header controls inside sessions tab */}
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[#D8CBB5] pb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold font-serif text-slate-800">NHẬT KÝ GIẢNG DẠY</span>
                <span className="brutal-badge">
                  {sessions.length} Buổi ghi nhận
                </span>
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setShowAutoSchedule(!showAutoSchedule)}
                  className="px-2.5 py-1.5 text-[10px] font-bold border border-[#D8CBB5] bg-white hover:bg-[#FAF3E0] rounded-xl transition-all flex items-center gap-1 shadow-sm"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Lập lịch tự động
                </button>
                <button 
                  onClick={handleMarkAllPresent}
                  className="px-2.5 py-1.5 text-[10px] font-bold border border-[#D8CBB5] bg-[#FCFAF6] hover:bg-emerald-50 text-emerald-700 rounded-xl transition-all shadow-sm"
                >
                  Học Tất Cả
                </button>
                <button 
                  onClick={handleClearSessions}
                  className="px-2.5 py-1.5 text-[10px] font-bold border border-[#D8CBB5] bg-[#FCFAF6] hover:bg-rose-50 text-rose-700 rounded-xl transition-all shadow-sm"
                >
                  Xóa Sạch
                </button>
              </div>
            </div>

            {/* Auto Schedule Sub-panel */}
            {showAutoSchedule && (
              <div className="border border-[#D8CBB5] shadow-sm p-4.5 rounded-2xl flex flex-col gap-3 bg-[#FCFAF6]">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between font-serif">
                  <span>Thiết lập lịch cố định trong tuần:</span>
                  <span className="text-[9px] text-slate-400 font-bold">(Tính tự động theo Tháng {data.periodMonth})</span>
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Thứ 2', val: 1 },
                    { label: 'Thứ 3', val: 2 },
                    { label: 'Thứ 4', val: 3 },
                    { label: 'Thứ 5', val: 4 },
                    { label: 'Thứ 6', val: 5 },
                    { label: 'Thứ 7', val: 6 },
                    { label: 'Chủ Nhật', val: 0 }
                  ].map(day => {
                    const isSelected = selectedDays.includes(day.val);
                    return (
                      <button
                        key={day.val}
                        onClick={() => toggleDaySelection(day.val)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                            : 'bg-white border-[#D8CBB5] text-slate-650 hover:bg-[#FAF3E0]'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex gap-2 justify-end mt-2 pt-2 border-t border-[#D8CBB5]/60">
                  <button 
                    onClick={() => setShowAutoSchedule(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    onClick={handleGenerateWeeklySessions}
                    className="px-4 py-1.5 text-xs font-bold text-white rounded-xl shadow-sm hover:shadow active:scale-95 transition-all"
                    style={{ backgroundColor: activeTheme.primary }}
                  >
                    Tạo danh sách
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic Table list */}
            {sessions.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-[#D8CBB5] rounded-2xl text-slate-400 bg-white/40">
                <p className="text-xs font-bold font-serif">Nhật ký trống.</p>
                <p className="text-[10px] mt-1">Nhấp "Thêm Buổi Học" hoặc "Lập Lịch Tự Động" để ghi danh.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1.5">
                {sessions.map((session, index) => (
                  <div 
                    key={session.id} 
                    className="flex items-center gap-2.5 p-2.5 border border-[#E0D4C3] rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Index Label */}
                    <span className="text-[10px] font-bold text-slate-500 w-6 text-center border-r border-[#D8CBB5] pr-1.5 font-mono">
                      #{index + 1}
                    </span>

                    {/* Date Input */}
                    <div className="w-[90px]">
                      <input 
                        type="text" 
                        value={session.date} 
                        onChange={(e) => handleUpdateSession(session.id, 'date', e.target.value)}
                        placeholder="DD/MM"
                        className="w-full text-center py-1 px-1.5 text-xs font-bold border border-[#D8CBB5] bg-[#FCFAF6] rounded-lg focus:outline-none focus:bg-white font-mono"
                      />
                    </div>

                    {/* Segmented Status Selector */}
                    <div className="flex-1 flex bg-[#F4EFEB] p-0.5 rounded-lg text-[9px] font-bold border border-[#D8CBB5]">
                      {[
                        { label: 'Học', color: 'text-rose-700 bg-white border border-[#D8CBB5] shadow-sm font-bold' },
                        { label: 'Nghỉ', color: 'text-slate-550 bg-white border border-[#D8CBB5] shadow-sm font-bold' },
                        { label: 'Bù', color: 'text-emerald-700 bg-white border border-[#D8CBB5] shadow-sm font-bold' }
                      ].map(item => {
                        const isActive = session.status === item.label;
                        return (
                          <button
                            key={item.label}
                            onClick={() => handleUpdateSession(session.id, 'status', item.label)}
                            className={`flex-1 py-1 rounded-md transition-all ${
                              isActive 
                                ? item.color 
                                : 'text-slate-450 hover:text-slate-800'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Price Input (Shows default unitPrice as placeholder, completely deletable) */}
                    <div className="w-[85px] flex items-center gap-0.5 border border-[#D8CBB5] bg-[#FCFAF6] rounded-lg px-1 py-0.5 shrink-0">
                      <span className="text-[9px] font-bold text-slate-400">₫</span>
                      <input 
                        type="number" 
                        min="0"
                        value={session.price !== undefined && session.price !== null ? session.price : ''} 
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateSession(
                            session.id, 
                            'price', 
                            val === '' ? undefined : Math.max(0, parseFloat(val) || 0)
                          );
                        }}
                        placeholder={data.unitPrice.toString()}
                        className="w-full text-[10px] font-bold bg-transparent text-slate-700 focus:outline-none placeholder-slate-400 font-mono text-right"
                      />
                    </div>

                    {/* Delete Action */}
                    <button 
                      onClick={() => handleRemoveSession(session.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all"
                      title="Xóa buổi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Session Trigger */}
            <button 
              onClick={handleAddSession}
              className="w-full py-2.5 border border-dashed border-[#D8CBB5] hover:border-solid hover:bg-[#FAF3E0] text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all mt-1"
            >
              <Plus className="w-4 h-4" />
              THÊM GHI CHÉP NGÀY MỚI
            </button>
          </div>
        )}

        {/* TAB: Nhận xét học tập & Lộ trình sắp tới */}
        {activeTab === 'notes' && (
          <div className="flex flex-col gap-5 animate-fade-in">
            {/* Overview bullet notes */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-serif text-slate-800">TỔNG QUAN</span>
                <span className="brutal-badge">{data.overviewNotes.length} dòng</span>
              </div>
              {data.overviewNotes.map((note, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => handleArrayItemChange('overviewNotes', i, e.target.value)}
                    placeholder="Nhận xét tổng quan..."
                    className="brutal-input flex-1"
                  />
                  <button
                    onClick={() => handleRemoveArrayItem('overviewNotes', i)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddArrayItem('overviewNotes')}
                className="w-full py-2 border border-dashed border-[#D8CBB5] hover:border-solid hover:bg-[#FAF3E0] text-slate-700 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                THÊM DÒNG NHẬN XÉT
              </button>
            </div>

            {/* Subject-specific sections */}
            <div className="flex flex-col gap-3 border-t border-[#D8CBB5] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-serif text-slate-800">NHẬN XÉT THEO CHUYÊN ĐỀ</span>
                <span className="brutal-badge">{data.subjectSections.length} mục</span>
              </div>
              {data.subjectSections.map((sec) => (
                <div key={sec.id} className="border border-[#E0D4C3] rounded-xl p-3 bg-white shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => handleSubjectTitleChange(sec.id, e.target.value)}
                      placeholder="Tên chuyên đề (VD: Đại số)"
                      className="brutal-input flex-1 font-bold"
                    />
                    <button
                      onClick={() => handleRemoveSubject(sec.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all shrink-0"
                      title="Xóa chuyên đề"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {sec.notes.map((note, i) => (
                    <div key={i} className="flex items-center gap-2 pl-3">
                      <span className="text-slate-400 text-xs shrink-0">+</span>
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => handleSubjectNoteChange(sec.id, i, e.target.value)}
                        placeholder="Nhận xét..."
                        className="brutal-input flex-1 text-xs py-2"
                      />
                      <button
                        onClick={() => handleRemoveSubjectNote(sec.id, i)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddSubjectNote(sec.id)}
                    className="ml-3 text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mt-0.5"
                  >
                    <Plus className="w-3 h-3" /> Thêm dòng
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddSubject}
                className="w-full py-2 border border-dashed border-[#D8CBB5] hover:border-solid hover:bg-[#FAF3E0] text-slate-700 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                THÊM CHUYÊN ĐỀ
              </button>
            </div>

            {/* Footer note */}
            <div className="flex flex-col gap-1.5 border-t border-[#D8CBB5] pt-4">
              <label className="text-xs font-bold text-slate-655 font-serif">Ghi Chú Cuối Phiếu</label>
              <textarea
                value={data.footerNote}
                onChange={(e) => handleChange('footerNote', e.target.value)}
                placeholder="Phụ huynh vui lòng kiểm tra thông tin học phí và lịch học. Cháu cảm ơn ạ."
                rows={2}
                className="brutal-input resize-none"
              />
            </div>
          </div>
        )}

        {/* TAB 3: Banking & Payment */}
        {activeTab === 'payment' && (
          <div className="flex flex-col gap-4.5 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-655 font-serif">Ngân Hàng</label>
                <select 
                  value={data.bankName} 
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  className="brutal-input appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%239C8E79%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[right_12px_center] bg-no-repeat font-serif"
                >
                  <option value="">-- Chọn ngân hàng đối soát --</option>
                  {POPULAR_BANKS.map(bank => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-655 font-serif">Chủ Sở Hữu</label>
                <input 
                  type="text" 
                  value={data.accountHolder} 
                  onChange={(e) => handleChange('accountHolder', e.target.value)}
                  placeholder="NGUYEN THI HANG"
                  className="brutal-input uppercase"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-655 font-serif">Số Tài Khoản</label>
              <input 
                type="text" 
                value={data.accountNumber} 
                onChange={(e) => handleChange('accountNumber', e.target.value)}
                placeholder="0123456789"
                className="brutal-input tracking-wider font-mono"
              />
            </div>

            {/* QR Selector */}
            <div className="border border-[#D8CBB5] p-4.5 rounded-2xl flex flex-col gap-3.5 bg-[#FAF8F3]">
              <label className="text-xs font-bold text-slate-700 uppercase font-serif flex items-center gap-1.5">
                <QrCode className="w-4 h-4" />
                QR
              </label>

              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => handleChange('qrCodeType', 'vietqr')}
                  className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 shadow-sm ${
                    data.qrCodeType === 'vietqr'
                      ? 'bg-emerald-700 text-white shadow-none border-emerald-700'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span className="font-bold text-[10px] font-serif">VIETQR DỰNG TỰ ĐỘNG (ĐỀ XUẤT)</span>
                  <span className={`text-[8px] font-bold ${data.qrCodeType === 'vietqr' ? 'text-emerald-150 opacity-90' : 'text-emerald-650'}`}>
                    Báo đúng số học phí
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('qrCodeType', 'custom')}
                  className={`py-2 px-3 border border-[#D8CBB5] rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 shadow-sm ${
                    data.qrCodeType === 'custom'
                      ? 'bg-slate-800 text-white shadow-none border-slate-800'
                      : 'bg-white text-slate-700 hover:bg-[#FCFAF6]'
                  }`}
                >
                  <span className="font-bold text-[10px] font-serif">TẢI QR LÊN</span>
                  <span className="text-[8px] opacity-70">Ví Momo / QR cố định</span>
                </button>
              </div>

              {/* Dynamic QR Input depending on type */}
              {data.qrCodeType === 'vietqr' ? (
                <div className="text-[9.5px] border border-[#D8CBB5] p-3 rounded-xl font-medium bg-white leading-relaxed text-slate-650 font-serif">
                  📖 <strong>Tiện ích đối soát:</strong> Mã QR sẽ mang đúng tổng số tiền học phí của tháng này: <strong>{ 
                    sessions.filter(s => s.status === 'Học' || s.status === 'Bù')
                      .reduce((sum, s) => sum + (s.price !== undefined && s.price !== null ? s.price : data.unitPrice), 0)
                      .toLocaleString('vi-VN')
                  } đ</strong>. Phụ huynh chỉ cần dùng app ngân hàng quét là xong.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-center border border-dashed border-[#D8CBB5] rounded-xl p-4 bg-white hover:bg-slate-50 transition-all relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLocalQrUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-1 pointer-events-none">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-700">
                        {data.customQrUrl ? 'CHỌN FILE KHÁC...' : 'TẢI MÃ QR TÀI KHOẢN LÊN'}
                      </span>
                    </div>
                  </div>
                  {data.customQrUrl && (
                    <div className="flex items-center gap-2 p-1.5 border border-[#D8CBB5] rounded-xl bg-white">
                      <img src={data.customQrUrl} className="w-8 h-8 border border-slate-100 object-cover" alt="Custom QR Preview" />
                      <span className="text-[9.5px] font-bold text-emerald-700 flex items-center gap-0.5">
                        <Check className="w-3.5 h-3.5" /> ĐÃ NHẬP FILE QR
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Design & Giao Diện */}
        {activeTab === 'theme' && (
          <div className="flex flex-col gap-4.5 animate-fade-in">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-serif">
              Chọn Tông Màu Giáo Trình
            </span>
            <div className="flex flex-col gap-3">
              {Object.keys(themes).map(key => {
                const theme = themes[key];
                const isActive = selectedThemeKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedThemeKey(key)}
                    className={`p-3.5 border border-[#D8CBB5] text-left flex items-center justify-between transition-all bg-white rounded-2xl shadow-sm ${
                      isActive 
                        ? 'ring-2 ring-slate-800 bg-[#FCFAF6] border-slate-800' 
                        : 'hover:bg-[#FCFAF6]'
                     }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Visual color dot stack */}
                      <div className="flex -space-x-1.5">
                        <span className="w-5 h-5 border border-white rounded-full shadow-sm" style={{ backgroundColor: theme.primary, zIndex: 3 }} />
                        <span className="w-5 h-5 border border-white rounded-full shadow-sm" style={{ backgroundColor: theme.banner, zIndex: 2 }} />
                        <span className="w-5 h-5 border border-white rounded-full shadow-sm" style={{ backgroundColor: theme.bgCard, zIndex: 1 }} />
                      </div>
                      <span className="text-[12px] font-bold text-slate-850 font-serif">
                        {theme.name.split(' (')[0]}
                      </span>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-slate-800 stroke-[3px]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
