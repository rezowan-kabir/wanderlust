import Image from "next/image";

type FeatureCardProps = {
  iconSrc: string;
  title: string;
  description: string;
};

/** White card with an icon, title and short blurb. */
export function FeatureCard({ iconSrc, title, description }: FeatureCardProps) {
  return (
    <article className="flex min-w-0 flex-col bg-white p-3 sm:p-8">
      <Image
        src={iconSrc}
        alt=""
        width={36}
        height={36}
        className="size-7 sm:size-9"
      />
      <h3 className="mt-3 text-sm font-normal leading-snug text-neutral-900 sm:mt-5 sm:text-2xl">
        {title}
      </h3>
      <p className="mt-2 text-[11px] leading-snug text-neutral-500 sm:mt-4 sm:text-[15px] sm:leading-relaxed">
        {description}
      </p>
    </article>
  );
}
