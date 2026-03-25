import { getCachedSession } from "@/lib/session";
import { getProfileData, type ProfileData } from "@/lib/profile-service";
import { AccountPageClient } from "@/components/account/account-page-client";

const defaultProfile: ProfileData = {
  fullName: "Usuario",
  email: "",
  joinDate: "",
  avatar: null,
  phone: "",
  city: "",
  bio: "",
  website: "",
  linkedinUrl: "",
  instagramUrl: "",
  coursesCompleted: 0,
  coursesInProgress: 0,
};

export default async function AccountPage() {
  const session = await getCachedSession();
  if (!session?.user?.id) return null;

  let initialProfile: ProfileData = defaultProfile;
  try {
    initialProfile = await getProfileData(session.user.id);
  } catch {
    initialProfile = {
      ...defaultProfile,
      fullName: session.user.name ?? "Usuario",
      email: session.user.email ?? "",
    };
  }

  return <AccountPageClient initialProfile={initialProfile} />;
}
