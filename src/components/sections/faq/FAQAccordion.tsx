"use client";

import { useState } from "react";
import { FAQ_CATEGORIES, FAQ_ITEMS } from "@/lib/constants";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function FAQAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="py-24 px-6 bg-off-white">
      <div className="max-w-4xl mx-auto space-y-16">
        {FAQ_CATEGORIES.map((category) => {
          const items = FAQ_ITEMS.filter((q) => q.category === category);
          if (items.length === 0) return null;
          return (
            <div key={category}>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-near-black mb-8 leading-tight">
                {category}
              </h2>
              <div className="divide-y divide-light-gray border-t border-b border-light-gray">
                {items.map((item) => {
                  const id = `${slugify(category)}-${slugify(item.question)}`;
                  const isOpen = openId === id;
                  return (
                    <div key={id}>
                      <button
                        type="button"
                        onClick={() => setOpenId(isOpen ? null : id)}
                        className="w-full flex items-start justify-between text-left py-6 gap-6 group"
                        aria-expanded={isOpen}
                        aria-controls={`${id}-panel`}
                      >
                        <span className="font-display text-lg md:text-xl font-semibold text-near-black leading-snug group-hover:text-primary-green transition-colors">
                          {item.question}
                        </span>
                        <span
                          className={`shrink-0 mt-1 w-6 h-6 flex items-center justify-center border border-near-black/30 rounded-full text-near-black transition-transform duration-200 ${
                            isOpen ? "rotate-45" : ""
                          }`}
                          aria-hidden="true"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 5v14M5 12h14"
                            />
                          </svg>
                        </span>
                      </button>
                      {isOpen && (
                        <div
                          id={`${id}-panel`}
                          className="pb-6 font-sans text-base text-charcoal/80 leading-relaxed"
                        >
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
