import { FAQ_ITEMS } from "@/lib/constants";

interface FAQSchemaProps {
  items?: { question: string; answer: string }[];
}

export default function FAQSchema({ items }: FAQSchemaProps) {
  const source = items ?? FAQ_ITEMS;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: source.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
