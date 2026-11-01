import { FeatureCard } from "@/components/feature-card";

const features = [
  {
    iconSrc: "/assets/ShieldCheck.png",
    title: "Safe & Secure",
    description:
      "Your safety is our priority with comprehensive travel insurance and 24/7 support.",
  },
  {
    iconSrc: "/assets/MapTrifold.png",
    title: "Expert Guides",
    description:
      "Local experts who bring destinations to life with authentic cultural insights.",
  },
  {
    iconSrc: "/assets/Headset.png",
    title: "24/7 Support",
    description:
      "Round-the-clock customer service to assist you wherever your journey takes you.",
  },
];

/** Pale-blue band with three value-proposition cards. */
export function WhyChooseUs() {
  return (
    <section className="bg-[#e0f7fa] py-28">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <h2 className="text-center text-4xl font-light leading-tight text-neutral-900 sm:text-5xl lg:text-6xl">
          Why Choose Wanderlust
        </h2>
        <p className="mt-4 text-center text-base text-neutral-500">
          Your trusted partner for exceptional travel experiences
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
