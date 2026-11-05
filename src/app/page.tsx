import { Banner } from "@/components/banner";
import { CallToAction } from "@/components/cta";
import { Testimonials } from "@/components/testimonials";
import { WhyChooseUs } from "@/components/why-choose-us";
import FeaturedDestinations from "@/components/featured-destinations";
export default function Home() {
  return (
    <div className="relative">
      <Banner />
      <FeaturedDestinations />
      <WhyChooseUs />
      <Testimonials />
      <CallToAction />
    </div>
  );
}
