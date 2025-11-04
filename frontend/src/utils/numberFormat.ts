/**
 * Format large numbers with abbreviations (k, M, B, T)
 * Keeps 3-4 significant figures
 * 
 * Examples:
 * - 999 → "999"
 * - 1000 → "1k"
 * - 1234 → "1.23k"
 * - 12345 → "12.3k"
 * - 123456 → "123k"
 * - 1234567 → "1.23M"
 * - 1200000 → "1.2M"
 */
export function formatNumber(value: number): string {
  if (value < 1000) {
    return value.toString();
  }
  
  const units = [
    { value: 1e12, symbol: 'T' }, // Trillion
    { value: 1e9, symbol: 'B' },  // Billion
    { value: 1e6, symbol: 'M' },  // Million
    { value: 1e3, symbol: 'k' }   // Thousand
  ];
  
  for (const unit of units) {
    if (value >= unit.value) {
      const scaled = value / unit.value;
      
      // Determine decimal places based on magnitude
      let decimals: number;
      if (scaled >= 100) {
        decimals = 0;  // 123k, 456M
      } else if (scaled >= 10) {
        decimals = 1;  // 12.3k, 45.6M
      } else {
        decimals = 2;  // 1.23k, 4.56M
      }
      
      // Format and remove trailing zeros
      const formatted = scaled.toFixed(decimals);
      return formatted.replace(/\.?0+$/, '') + unit.symbol;
    }
  }
  
  return value.toString();
}

/**
 * Get dynamic font size based on value magnitude
 * Larger numbers get slightly bigger display
 */
export function getDynamicFontSize(value: number): number {
  if (value < 1000) return 18;        // Base size
  if (value < 10000) return 20;       // 1k-10k
  if (value < 100000) return 22;      // 10k-100k
  if (value < 1000000) return 24;     // 100k-1M
  if (value < 10000000) return 26;    // 1M-10M
  return 28;                          // 10M+
}

