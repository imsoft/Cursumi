import { getCachedSession } from "@/lib/session";
import { getProfileData } from "@/lib/profile-service";
import { AccountPageClient } from "@/components/account/account-page-client";

export default async function AccountPage() {
  const session = await getCachedSession();
  if (!session) return null;
  const initialProfile = await getProfileData(session.user.id);
  return <AccountPageClient initialProfile={initialProfile} />;
}
