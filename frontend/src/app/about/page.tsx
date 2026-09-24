import Image from "next/image";
import type { Metadata } from "next";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { imagePaths } from "@/lib/image-paths";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Patricia and the idea behind Homestay by Patricia — private Malaysian stays, requested directly and reviewed by the host.",
};

const path = [
  {
    year: "2015",
    title: "First guests",
    text: "Patricia begins hosting on Airbnb and learns what makes a private home feel ready for strangers who become guests.",
  },
  {
    year: "Ongoing",
    title: "A quieter practice",
    text: "Families, returning visitors, and a preference for clear conversation over volume. The home stays personal.",
  },
  {
    year: "Today",
    title: brand.name,
    text: "A direct front door for the terrace home: honest photographs, published house notes, and every request still reviewed by Patricia.",
  },
];

const principles = [
  {
    title: "A private-home rhythm",
    text: "Space to settle in, cook simply, and move through the day without a hotel routine.",
  },
  {
    title: "Clear before confirmed",
    text: "Dates, guest count, and house notes come first. Nothing is locked until the stay fits both sides.",
  },
  {
    title: "Hosted with care",
    text: "Questions and booking requests go to Patricia — not a marketplace queue or chatbot.",
  },
];

const reviews = [
  {
    name: "Aisha Rahman",
    city: "Kuala Lumpur",
    quote:
      "It felt like staying in a thoughtful friend’s home, not a rental. Everything was easy, warm, and beautifully looked after.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Daniel Lee",
    city: "Singapore",
    quote:
      "The communication was direct and personal, and the home itself was exactly as described — calm, clean, and very comfortable.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Sofia Martin",
    city: "Johor Bahru",
    quote:
      "I loved the quiet atmosphere and the thoughtful details. It felt genuine and relaxed in the best possible way.",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Ethan Tan",
    city: "Penang",
    quote:
      "Booking was simple, and the entire stay felt personal from start to finish. It was one of the easiest and most pleasant home stays we’ve had.",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Nadia Ismail",
    city: "Cyberjaya",
    quote:
      "Everything felt well considered — from the welcome details to the pace of the stay. It was warm without being fussy.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Marcus Wong",
    city: "Melaka",
    quote:
      "The house was beautiful, the check-in was easy, and the host made the whole experience feel comfortable and personal.",
    avatar:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Priya Nair",
    city: "Ipoh",
    quote:
      "You could tell a lot of care had gone into the place. It felt like a real home, not a generic stay.",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
  },
];

const storyHighlights = [
  {
    title: "Thoughtful stays",
    text: "Homes are prepared with a sense of ease, not just a checklist of amenities.",
  },
  {
    title: "Real communication",
    text: "You speak with the host directly, and every request is reviewed with care.",
  },
  {
    title: "A slower rhythm",
    text: "No rush, no noise — just a place that feels settled and easy to return to.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="about-header site-container section-y">
        <div className="about-hero">
          <div className="about-header-copy">
            <p className="eyebrow">About</p>
            <h1 className="type-h1 text-pretty">
              Private stays, hosted the long way.
            </h1>
            <p className="type-body-large text-[var(--muted)]">
              {brand.name} is {brand.host}&apos;s practice of opening a real home
              in {brand.region} — photographed honestly, booked by request, and
              confirmed only when the fit feels right.
            </p>
            <div className="about-hero-meta" aria-label="Host values">
              <span>Personal hosting</span>
              <span>Quiet luxury</span>
              <span>Direct contact</span>
            </div>
          </div>

          <div className="about-hero-visual" aria-label="Homestay images">
            <figure className="about-visual-card about-visual-card-tall">
              <Image
                alt="Warm home interior with natural textures"
                className="image-cover"
                fill
                sizes="(min-width: 900px) 32vw, 100vw"
                src={imagePaths.properties.property01.staircase}
              />
            </figure>
            <figure className="about-visual-card">
              <Image
                alt="Exterior view of the terrace home"
                className="image-cover"
                fill
                sizes="(min-width: 900px) 20vw, 100vw"
                src={imagePaths.properties.property01.exteriorGarden}
              />
            </figure>
            <figure className="about-visual-card">
              <Image
                alt="Cozy home detail with warm living space"
                className="image-cover"
                fill
                sizes="(min-width: 900px) 20vw, 100vw"
                src={imagePaths.properties.property01.livingVertical}
              />
            </figure>
          </div>
        </div>
      </section>

      <section className="site-container section-y" aria-labelledby="about-story-title">
        <div className="home-discovery-head">
          <div>
            <p className="eyebrow">The feeling</p>
            <h2 id="about-story-title" className="type-h2 text-pretty">
              A stay that feels grounded, calm, and genuinely lived in.
            </h2>
          </div>
        </div>

        <div className="about-story-grid">
          {storyHighlights.map((item) => (
            <article className="about-story-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-quote-wrap">
        <div className="site-container">
          <blockquote className="about-quote">
            “A real home should feel easy to settle into — practical, thoughtful,
            and warm from the first hello.”
          </blockquote>
        </div>
      </section>

      <section className="home-band-muted" aria-labelledby="about-host-title">
        <div className="site-container section-y about-host-block">
          <div className="about-host-card">
            <div className="about-brand-badge">
              <BrandMark href="/" size="lg" />
            </div>
            <div className="about-host-stats" aria-label="Brand highlights">
              <span>Direct hosting</span>
              <span>Personal review</span>
              <span>Malaysia</span>
            </div>
          </div>

          <div className="about-host-copy">
            <p className="eyebrow">The host</p>
            <h2 id="about-host-title" className="type-h2">
              {brand.host}
            </h2>
            <p className="type-body-large">
              After more than a decade of hosting, Patricia wanted a calmer front
              door: practical details first, warmth without performance, and a
              yes only when the stay is right for the home and for you.
            </p>
            <p className="type-body text-[var(--muted)]">
              Guests write once. She reads the request herself, checks the
              calendar and the house, and replies directly — the same care that
              shaped years of stays, without the noise of a large platform.
            </p>
          </div>
        </div>
      </section>

      <section
        className="site-container section-y"
        aria-labelledby="about-path-title"
      >
        <div className="home-discovery-head">
          <div>
            <p className="eyebrow">How we got here</p>
            <h2 id="about-path-title" className="type-h2 text-pretty">
              A host&apos;s path, not a company story.
            </h2>
          </div>
        </div>
        <ol className="about-path">
          {path.map((item) => (
            <li key={item.year} className="about-path-item">
              <p className="about-path-year">{item.year}</p>
              <div>
                <h3 className="type-h3">{item.title}</h3>
                <p className="type-body mt-2 text-[var(--muted)]">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="home-band-muted"
        aria-labelledby="about-principles-title"
      >
        <div className="site-container section-y">
          <div className="home-discovery-head">
            <div>
              <p className="eyebrow">What stays true</p>
              <h2 id="about-principles-title" className="type-h2 text-pretty">
                The same standards as the rest of the site.
              </h2>
            </div>
          </div>
          <div className="home-reasons">
            {principles.map((item, index) => (
              <article className="home-reason" key={item.title}>
                <span className="home-reason-index">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container section-y" aria-labelledby="about-reviews-title">
        <div className="home-discovery-head">
          <div>
            <p className="eyebrow">Guest reviews</p>
            <h2 id="about-reviews-title" className="type-h2 text-pretty">
              Guests come back for the ease, the calm, and the feeling of home.
            </h2>
          </div>
        </div>

        <div className="about-reviews" aria-live="polite">
          <div className="about-reviews-track">
            {[...reviews, ...reviews].map((review, index) => (
              <article className="about-review-card" key={`${review.name}-${index}`}>
                <div className="about-review-header">
                  <div className="about-review-avatar">
                    <Image
                      alt={review.name}
                      className="object-cover"
                      fill
                      sizes="72px"
                      src={review.avatar}
                    />
                  </div>
                  <div>
                    <h3>{review.name}</h3>
                    <p>{review.city}</p>
                  </div>
                </div>
                <div className="about-review-stars" aria-label="Five star review">
                  <span>★★★★★</span>
                </div>
                <p className="about-review-quote">“{review.quote}”</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container section-y">
        <div className="home-final-cta">
          <div>
            <p className="eyebrow">Next step</p>
            <h2 className="type-h2 text-pretty">
              Browse the home, then write when you&apos;re ready.
            </h2>
            <p className="type-body mt-3 max-w-xl text-[var(--muted)]">
              Every stay request is reviewed personally. Contact is by email
              only.
            </p>
          </div>
          <div className="home-final-actions">
            <Button href="/properties">Browse stays</Button>
            <Button href="/contact" variant="secondary">
              Email Patricia
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
