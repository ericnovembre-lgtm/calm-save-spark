/**
 * Generate payment request links for various payment platforms
 */

export function generateVenmoLink(recipientUsername: string, amount: number, note: string): string {
  const params = new URLSearchParams({
    txn: 'pay',
    recipients: recipientUsername,
    amount: amount.toString(),
    note: note,
  });
  return `https://venmo.com/?${params.toString()}`;
}

export function generateZellePaymentText(amount: number, merchant: string): string {
  return `Hi! Could you send me $${amount.toFixed(2)} for ${merchant}? Thanks!`;
}

export function generatePayPalLink(recipientEmail: string, amount: number, note: string): string {
  const params = new URLSearchParams({
    cmd: '_xclick',
    business: recipientEmail,
    amount: amount.toString(),
    item_name: note,
    currency_code: 'USD',
  });
  return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
}

export function generateCashAppLink(cashtag: string, amount: number, note: string): string {
  const params = new URLSearchParams({
    amount: amount.toString(),
    note: note,
  });
  return `https://cash.app/${cashtag}?${params.toString()}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
