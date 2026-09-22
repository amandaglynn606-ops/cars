import { T } from './RegionalProvider'
import WhatsappIcon from './WhatsappIcon'

export default function EnquiryFallback({ href }: { href: string }) {
  return (
    <section className="z-section" style={{ textAlign: 'center', width: '100%' }}>
      <h2 className="font-display" style={{ fontSize: 32 }}>
        <T>Speak with the Zavi team</T>
      </h2>
      <p className="z-note" style={{ marginBlock: 20 }}>
        <T>
          Online submissions are temporarily unavailable. Contact us on WhatsApp to discuss your
          enquiry.
        </T>
      </p>
      <a href={href} target="_blank" rel="noopener noreferrer" className="z-button">
        <WhatsappIcon size={20} />
        <T>Enquire on WhatsApp</T>
      </a>
    </section>
  )
}
