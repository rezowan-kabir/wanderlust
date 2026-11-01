import { Banner } from "@/components/banner";
import { Navbar } from "@/components/navbar";
import { WhyChooseUs } from "@/components/why-choose-us";

export default function Home() {
  return (
    <div className="relative">
      <Navbar />
      <Banner />
      <WhyChooseUs />
    </div>
  );
}
