import Link from 'next/link'
import Icon from './Icon'
import { T } from './RegionalProvider'

export default function PartnerPaths() {
  return (
    <div className="z-partner-paths">
      <article className="z-partner-path z-partner-path-owner">
        <div className="z-partner-path-top">
          <p className="z-kicker">
            <T>For private car owners</T>
          </p>
          <span aria-hidden="true">01</span>
        </div>
        <h3>
          <T>Your car.</T>
          <br />
          <T>A rental opportunity.</T>
        </h3>
        <p>
          <T>
            Consign your car with Zavi and explore earning from rentals when you are not using it.
            We review the vehicle and agree how it will be listed and managed with you.
          </T>
        </p>
        <ul>
          <li>
            <Icon name="check" size={16} />
            <T>Submit your car for a suitability review</T>
          </li>
          <li>
            <Icon name="check" size={16} />
            <T>Discuss rental pricing and management</T>
          </li>
          <li>
            <Icon name="check" size={16} />
            <T>Agree your terms before the car goes live</T>
          </li>
        </ul>
        <Link href="/partners/consign-your-car" className="z-button">
          <T>Consign your car</T>
          <Icon name="arrow" size={20} />
        </Link>
      </article>
      <article className="z-partner-path z-partner-path-agency">
        <div className="z-partner-path-top">
          <p className="z-kicker">
            <T>For car rental agencies</T>
          </p>
          <span aria-hidden="true">02</span>
        </div>
        <h3>
          <T>Your fleet.</T>
          <br />
          <T>More ways to be found.</T>
        </h3>
        <p>
          <T>
            Display your rental cars on Zavi with a monthly subscription. Apply with your agency and
            fleet details to discuss the listing plan.
          </T>
        </p>
        <ul>
          <li>
            <Icon name="check" size={16} />
            <T>Monthly subscription to display cars</T>
          </li>
          <li>
            <Icon name="check" size={16} />
            <T>Publish approved photos, details and rates</T>
          </li>
          <li>
            <Icon name="check" size={16} />
            <T>Confirm your subscription terms before activation</T>
          </li>
        </ul>
        <Link href="/partners/rental-agencies" className="z-button z-button-outline">
          <T>Apply for a monthly subscription</T>
          <Icon name="arrow" size={20} />
        </Link>
      </article>
    </div>
  )
}
