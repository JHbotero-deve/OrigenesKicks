export function generateWhatsAppLink(phone: string, message: string) {
  const cleanedPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return https://wa.me/?text=\;
}
