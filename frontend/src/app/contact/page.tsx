"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactDetails } from "@/lib/mock-data";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const subject = String(data.get("subject") || "Stay enquiry").trim();
    const message = String(data.get("message") || "").trim();
    const body = [`Name: ${name}`, `Email: ${email}`, "", message].join("\n");
    const href = `mailto:${contactDetails.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
    window.location.href = href;
  }

  return (
    <div className="contact-page site-container">
      <header className="contact-intro">
        <p className="eyebrow text-[var(--accent)]">Contact</p>
        <h1 className="type-h1 text-pretty">Write directly to Patricia.</h1>
        <p className="type-body-large text-[var(--muted)]">
          Questions about the home, timing, or a stay request — email is the
          only channel. She reads every message herself.
        </p>
      </header>

      <div className="contact-layout">
        <aside className="contact-aside" aria-label="Email">
          <div className="contact-email-card">
            <p className="eyebrow text-[var(--gold)]">Email</p>
            <a
              className="contact-email-link"
              href={`mailto:${contactDetails.email}`}
            >
              {contactDetails.email}
            </a>
            <p className="type-small mt-3 text-[var(--muted)]">
              Typical reply within one business day. Include preferred dates and
              guest count when you can.
            </p>
          </div>
          <div className="contact-note">
            <p className="type-small font-semibold text-[var(--ink)]">
              What helps
            </p>
            <ul>
              <li>Travel window or exact dates</li>
              <li>Number of guests</li>
              <li>Anything the home should be ready for</li>
            </ul>
          </div>
        </aside>

        <section
          className="contact-form-panel"
          aria-labelledby="contact-form-heading"
        >
          <h2 id="contact-form-heading" className="type-h3">
            Send a message
          </h2>
          <p className="type-small mt-1 text-[var(--muted)]">
            Opens your email app so the note goes straight to Patricia.
          </p>

          {submitted ? (
            <div className="contact-success" role="status">
              <p className="font-semibold text-[var(--ink)]">Ready to send</p>
              <p className="type-small mt-1 text-[var(--muted)]">
                Finish in your mail client, or write again to{" "}
                <a
                  className="underline underline-offset-2"
                  href={`mailto:${contactDetails.email}`}
                >
                  {contactDetails.email}
                </a>
                .
              </p>
              <Button
                className="mt-4"
                onClick={() => setSubmitted(false)}
                type="button"
                variant="secondary"
              >
                Write another
              </Button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={onSubmit}>
              <div className="contact-form-row">
                <Input
                  label="Name"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                />
                <Input
                  label="Your email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>
              <Input
                label="Subject"
                name="subject"
                placeholder="Dates, group size, or a question"
              />
              <Textarea
                label="Message"
                name="message"
                required
                rows={5}
                placeholder="Tell Patricia what you need…"
              />
              <div className="contact-form-actions">
                <Button type="submit">Open email to send</Button>
                <a
                  className="contact-direct-mail type-small"
                  href={`mailto:${contactDetails.email}`}
                >
                  Or email {contactDetails.email} directly
                </a>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
