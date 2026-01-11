import { HowItWorksHero } from "@/components/how-it-works/hero";
import { HowItWorksStudents } from "@/components/how-it-works/for-students";
import { HowItWorksInstructors } from "@/components/how-it-works/for-instructors";
import { HowItWorksBenefits } from "@/components/how-it-works/benefits-summary";
import { HowItWorksFAQ } from "@/components/how-it-works/faq";
import { HowItWorksFinalCTA } from "@/components/how-it-works/final-cta";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="space-y-4 pb-16">
        <HowItWorksHero />
        <HowItWorksStudents />
        <HowItWorksInstructors />
        <HowItWorksBenefits />
        <HowItWorksFAQ />
        <HowItWorksFinalCTA />
      </main>
    </div>
  );
}

