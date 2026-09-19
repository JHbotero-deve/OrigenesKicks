export function generateWhatsAppLink(phone: string, message: string) {
  const cleanedPhone = phone.replace(/\D/g, '');
  const normalizedPhone = cleanedPhone.startsWith('57') ? cleanedPhone : `57${cleanedPhone}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}
