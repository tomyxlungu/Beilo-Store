import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  label?: string;
  className?: string;
}

export default function WhatsAppButton({
  phoneNumber,
  message = 'Hi BEILO, I would like some help.',
  label = 'WhatsApp',
  className = '',
}: WhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} - Chat with BEILO on WhatsApp`}
      className={`whatsapp-button ${className}`}
    >
      <span className="whatsapp-icon">
        <MessageCircle size={17} strokeWidth={2} />
      </span>

      <span className="whatsapp-label">{label}</span>
    </a>
  );
}
