import { BRAND_PARTNERS } from '../../../constants/landing'
import { handleImgError } from '../../../constants/images'

export default function BrandPartners() {
  return (
    <section className="bg-[#06002b] py-14 md:py-20">
      <div className="section-container">
        <h2 className="font-heading text-[18px] md:text-[20px] font-bold text-white uppercase tracking-wider text-center mb-12">
          OUR BRAND PARTNERS
        </h2>

        {/* Row 1 */}
        <div className="flex items-center justify-center gap-16 md:gap-24 mb-12">
          {BRAND_PARTNERS.slice(0, 5).map((brand, i) => (
            <img key={i} src={brand.logo} alt={brand.name} className="w-auto h-[30px] md:h-[38px]" onError={handleImgError} loading="lazy" />
          ))}
        </div>

        {/* Row 2 */}
        <div className="flex items-center justify-center gap-16 md:gap-24">
          {BRAND_PARTNERS.slice(5, 9).map((brand, i) => (
            <img key={i} src={brand.logo} alt={brand.name} className="w-auto h-[30px] md:h-[38px]" onError={handleImgError} loading="lazy" />
          ))}
        </div>
      </div>
    </section>
  )
}
