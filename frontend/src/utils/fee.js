export function computeTotalFee(data, sessions) {
  if (data.feeMode === 'fixed') {
    return data.fixedTotalFee || 0;
  }
  const attendedSessions = sessions.filter(s => s.status === 'Học' || s.status === 'Bù');
  return attendedSessions.reduce((sum, s) => {
    const price = s.price !== undefined && s.price !== null ? s.price : data.unitPrice;
    return sum + price;
  }, 0);
}
