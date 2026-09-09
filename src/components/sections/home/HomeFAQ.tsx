import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import SectionIntro from "@/components/ui/SectionIntro";
import {
  MANAGEMENT_OFFERS,
  SERVICE_AREA_STATES,
} from "@/lib/management/constants";
import { ONBOARDING_STEPS } from "@/components/sections/management/ManagementOffer";

/**
 * Five questions an owner asks before applying, answered from the management
 * pages' own copy. The owner-keeps list, the service area, and the onboarding
 * steps are read from their modules; the fee answer states the structure and
 * never a number, because the fee model is env-gated and unset.
 */
function buildQuestions() {
  const states = SERVICE_AREA_STATES.map((s) => s.name);
  const stateList = `${states.slice(0, -1).join(", ")}, and ${states[states.length - 1]}`;
  const steps = ONBOARDING_STEPS.map((s) => s.step.toLowerCase());
  const stepList = `${steps.slice(0, -1).join(", ")}, then ${steps[steps.length - 1]}`;
  const keeps = MANAGEMENT_OFFERS.rooms.ownerKeeps;

  return [
    {
      q: "What do I keep when BNHG manages my asset?",
      a: `${keeps[0]}, ${keeps[1].toLowerCase()}, ${keeps[2].toLowerCase()}, and ${keeps[3].toLowerCase()}. BNHG runs the day-to-day. Ownership never moves.`,
    },
    {
      q: "Where does BNHG manage assets?",
      a: `${stateList}. Applications from outside those six states are not accepted right now.`,
    },
    {
      q: "What happens after I apply?",
      a: `Six steps: ${stepList}. Nothing is signed until the call, and the agreement is in writing before anything changes hands.`,
    },
    {
      q: "How are management fees structured?",
      a: "A percentage of gross, a one-time onboarding fee, and a minimum term. The exact numbers are covered on the call, once we have seen the asset.",
    },
    {
      q: "Do I have to hire BNHG to use the training?",
      a: "No. Most of the resources are free with an email address, the courses stand on their own, and management is only for owners who would rather hand it off.",
    },
  ];
}

export default function HomeFAQ() {
  const questions = buildQuestions();

  return (
    <section className="bg-white px-3 md:px-5 py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-3 md:px-5">
        <SectionIntro
          label="Common questions"
          heading="Straight answers before you apply."
        />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
        <div className="relative overflow-hidden rounded-card bg-near-black aspect-[4/5] lg:aspect-auto lg:min-h-full">
          <Image
            src="/images/Website Images/hf_20260524_001332_9c9c7835-c37e-4f0d-8e3e-377f0b34d3a5.png"
            alt="A furnished co-living living room in soft daylight"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover object-center"
            style={{ filter: "saturate(0.9) contrast(1.05)" }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-near-black/70 via-transparent to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-4 rounded-card border border-white/60 bg-white/85 backdrop-blur-xl text-near-black p-4 pr-5 transition-colors hover:bg-white"
            >
              <span>
                <span className="block font-display text-lg font-semibold leading-tight">
                  Have a different question?
                </span>
                <span className="block font-sans text-[13px] text-charcoal/75 mt-0.5">
                  We answer within one business day.
                </span>
              </span>
              <ArrowUpRight
                aria-hidden
                className="w-4 h-4 shrink-0 text-charcoal/60 transition-transform duration-300 group-hover:rotate-45"
              />
            </Link>
          </div>
        </div>

        <div>
          <div className="flex flex-col gap-3">
            {questions.map((item, i) => (
              <details
                key={item.q}
                open={i === 0}
                className="group rounded-card bg-cream border border-charcoal/10 open:border-deep-teal/30 transition-colors"
              >
                <summary className="flex items-center justify-between gap-6 cursor-pointer list-none px-6 py-5 md:px-7 [&::-webkit-details-marker]:hidden">
                  <span className="font-display text-lg md:text-xl font-semibold text-charcoal leading-snug">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className="w-9 h-9 shrink-0 rounded-full bg-white text-deep-teal flex items-center justify-center transition-transform duration-300 group-open:rotate-45"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.25} />
                  </span>
                </summary>
                <p className="font-sans text-base text-charcoal/80 leading-relaxed px-6 md:px-7 pb-6 -mt-1">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
