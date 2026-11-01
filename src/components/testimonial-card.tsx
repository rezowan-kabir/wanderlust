import Image from "next/image";

type TestimonialCardProps = {
  quote: string;
  author: string;
  location: string;
  image: string;
};

/** White bordered card: quote on the left, portrait on the right. */
export function TestimonialCard({
  quote,
  author,
  location,
  image,
}: TestimonialCardProps) {
  return (
    <article className="flex h-full flex-col gap-4 border border-neutral-200 bg-white p-6 sm:flex-row">
      <div className="flex flex-1 flex-col">
        <p className="text-[19px] leading-6 text-neutral-900">{quote}</p>

        {/* The em dash hangs outside the text block, like the design. */}
        <div className="mt-auto flex gap-2 pt-12">
          <span aria-hidden className="text-[17px] leading-tight text-brand">
            —
          </span>
          <div>
            <p className="text-[17px] leading-tight text-brand">{author}</p>
            <p className="mt-1 text-sm text-neutral-500">{location}</p>
          </div>
        </div>
      </div>

      <Image
        src={image}
        alt={`${author} from ${location}`}
        width={198}
        height={234}
        className="h-56 w-full shrink-0 object-cover sm:h-[234px] sm:w-[198px] lg:w-40 xl:w-[198px]"
      />
    </article>
  );
}
