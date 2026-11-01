import Image from "next/image";

type FeatureCardProps = {
  iconSrc: string;
  title: string;
  description: string;
};

/** White card with an icon, title and short blurb. */
export function FeatureCard({ iconSrc, title, description }: FeatureCardProps) {
  return (
    <article className="flex flex-col bg-white p-10">
      <Image src={iconSrc} alt="" width={40} height={40} className="size-10" />
      <h3 className="mt-6 text-[26px] font-normal leading-snug text-neutral-900">
        {title}
      </h3>
      <p className="mt-4 text-[15px] leading-relaxed text-neutral-500">
        {description}
      </p>
    </article>
  );
}
