import Link from 'next/link'
import Image from 'next/image'
import {
  getBrands,
  getBodyTypes,
  getCarsByBrand,
  getCarsByBodyType,
  categorySlug,
  categoryImage,
} from '@/lib/fleet'
import Icon from './Icon'
export default function DirectoryPage({ type }: { type: 'brand' | 'category' }) {
  const items = type === 'brand' ? getBrands() : getBodyTypes()
  return (
    <div className="container-lux">
      <header className="z-page-hero z-collection-hero">
        <h1>
          <T>{type === 'brand' ? 'Car brands' : 'Vehicle categories'}</T>
        </h1>
        <p className="z-lead">
          <T>
            {type === 'brand'
              ? 'Choose a brand to compare its listed models, photos and rental rates.'
              : 'Choose a category to browse its cars and compare daily rates.'}
          </T>
        </p>
      </header>
      <div className="z-directory-grid">
        {items.map((item) => {
          const cars = type === 'brand' ? getCarsByBrand(item.name) : getCarsByBodyType(item.name)
          const img = categoryImage(cars)
          return (
            <Link
              key={item.name}
              className="z-category-tile"
              href={(type === 'brand' ? '/brands/' : '/categories/') + categorySlug(item.name)}
            >
              {img && (
                <div className="z-directory-photo">
                  <Image
                    src={img}
                    alt={item.name + ' collection'}
                    fill
                    sizes="(max-width: 540px) 100vw, (max-width: 800px) 50vw, 33vw"
                  />
                </div>
              )}
              <div>
                <p>
                  {item.count} <T>vehicles</T>
                </p>
                <h3>
                  <T>{item.name}</T>
                  <Icon name="arrow" size={23} />
                </h3>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

import { T } from '@/components/RegionalProvider'
