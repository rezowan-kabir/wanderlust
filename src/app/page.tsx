import { Banner } from "@/components/banner";
import { CallToAction } from "@/components/cta";
import { Testimonials } from "@/components/testimonials";
import { WhyChooseUs } from "@/components/why-choose-us";

export default function Home() {
  return (
    <div className="relative">
      <Banner />
      <WhyChooseUs />
      <Testimonials />
      <CallToAction />
    </div>
  );
}
