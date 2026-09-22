import Image from 'next/image'
import { T } from './RegionalProvider'
import PartnerPaths from './PartnerPaths'
import PartnerMotion from './PartnerMotion'
import '@/app/partners/partners.css'

export default function EarnWithUs({ image }: { image: string }) {
  return (
    <PartnerMotion
      as="section"
      id="earn-with-us"
      className="z-home-section container-lux z-earn"
      aria-labelledby="earn-heading"
    >
      <header className="z-earn-heading">
        <div>
          <p className="z-kicker">
            <span>04 / </span>
            <T>Owners & agencies</T>
          </p>
          <h2 id="earn-heading">
            <T>Earn with us.</T>
          </h2>
          <p className="z-earn-lead">
            <T>A car to consign.</T>
            <br />
            <T>A fleet to connect.</T>
          </p>
          <p>
            <T>Two ways to partner with Zavi. Choose the one that fits you.</T>
          </p>
        </div>
        <div className="z-earn-image">
          <Image
            src={image}
            alt="Luxury vehicle in the Zavi rental collection"
            fill
            sizes="(max-width: 700px) 100vw, 40vw"
          />
        </div>
      </header>
      <PartnerPaths />
      <div className="z-earn-foot">
        <span>
          <T>One car or an entire fleet. Start with an application.</T>
        </span>
        <span>
          <T>Reviewed individually. Terms agreed together.</T>
        </span>
      </div>
    </PartnerMotion>
  )
}
