import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { TestimonialCard } from "@/components/testimonial-card";

const testimonials = [
  {
    quote:
      '"The Bali Trip Was Absolutely Magical! Every Detail Was Perfectly Planned. The Resorts Were Luxurious And The Cultural Experiences Were Unforgettable."',
    author: "Michael Chen",
    location: "Singapore",
    image: "/assets/person2.png",
  },
  {
    quote:
      '"Swiss Alps Adventure Exceeded All Expectations. The Mountain Views Were Breathtaking And Our Guide Was Incredibly Knowledgeable. Highly Recommend!"',
    author: "Sarah Johnson",
    location: "New York, USA",
    image: "/assets/person1.png",
  },
];

/** Testimonial band: heading + arrow controls on one row, cards below. */
export function Testimonials() {
  return (
    <section className="bg-[#fafafa] py-24">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <Carousel opts={{ align: "start" }} className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-4xl font-light leading-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                What Travelers Say
              </h2>
              <p className="mt-4 text-base text-neutral-500">
                Real experiences from our happy travelers
              </p>
            </div>

            <div className="flex gap-3">
              <CarouselPrevious
                icon={<ArrowLeft className="size-5" />}
                className="static size-14 rounded-full text-neutral-500"
              />
              <CarouselNext
                icon={<ArrowRight className="size-5" />}
                className="static size-14 rounded-full text-neutral-500"
              />
            </div>
          </div>

          <CarouselContent className="-ml-6 mt-10">
            {testimonials.map((testimonial) => (
              <CarouselItem
                key={testimonial.author}
                className="pl-6 lg:basis-1/2"
              >
                <TestimonialCard {...testimonial} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
