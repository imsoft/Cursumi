import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getInstructorEarnings } from "@/lib/instructor-service";
import { InstructorEarningsClient } from "@/components/instructor/instructor-earnings-client";

export default async function InstructorEarningsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const earnings = await getInstructorEarnings(session.user.id);

  return <InstructorEarningsClient earnings={earnings} />;
}
