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
    <article className="flex h-full flex-col gap-3 border border-neutral-200 bg-white p-4 sm:flex-row sm:gap-4 sm:p-5">
      <div className="flex flex-1 flex-col">
        <p className="text-base leading-6 text-neutral-900 sm:text-[17px]">
          {quote}
        </p>

        {/* The em dash hangs outside the text block, like the design. */}
        <div className="mt-auto flex gap-2 pt-8 sm:pt-10">
          <span aria-hidden className="text-base leading-tight text-brand">
            —
          </span>
          <div>
            <p className="text-base leading-tight text-brand">{author}</p>
            <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
              {location}
            </p>
          </div>
        </div>
      </div>

      <Image
        src={image}
        alt={`${author} from ${location}`}
        width={170}
        height={200}
        className="h-48 w-full shrink-0 object-cover sm:h-[200px] sm:w-[170px]"
      />
    </article>
  );
}
