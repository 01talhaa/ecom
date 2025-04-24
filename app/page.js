import FeaturedProducts from "@/components/home/FeaturedProducts"
import HeroBanner from "@/components/home/HeroBanner"
import CategoryShowcase from "@/components/home/CategoryShowcase"
import SpecialOffers from "@/components/home/SpecialOffers"
import Newsletter from "@/components/home/Newsletter"

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <HeroBanner />
      <CategoryShowcase />
      <FeaturedProducts />
      <SpecialOffers />
      <Newsletter />
    </div>
  )
}

