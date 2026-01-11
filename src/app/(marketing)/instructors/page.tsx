import { InstructorsHero } from "@/components/instructors/instructors-hero";
import { InstructorsBenefits } from "@/components/instructors/benefits-section";
import { InstructorsCourseTypes } from "@/components/instructors/course-types-section";
import { InstructorsSteps } from "@/components/instructors/steps-section";
import { InstructorsTestimonials } from "@/components/instructors/testimonials-section";
import { InstructorsFAQ } from "@/components/instructors/faq-section";
import { InstructorsFinalCTA } from "@/components/instructors/final-cta";

export default function InstructorsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="space-y-4 pb-16">
        <InstructorsHero />
        <InstructorsBenefits />
        <InstructorsCourseTypes />
        <InstructorsSteps />
        <InstructorsTestimonials />
        <InstructorsFAQ />
        <InstructorsFinalCTA />
      </main>
    </div>
  );
}

