"use client";

import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfilePageClient } from "@/components/profile/profile-page-client";
import { SettingsForm } from "@/components/settings/settings-form";
import type { ProfileData } from "@/lib/profile-service";
import { UserCircle, Settings } from "lucide-react";

interface AccountPageClientProps {
  initialProfile: ProfileData;
}

export function AccountPageClient({ initialProfile }: AccountPageClientProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const defaultTab = tabParam === "settings" ? "settings" : "profile";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cuenta"
        description="Tu información personal, nombre y contraseña en un solo lugar."
      />
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <ProfilePageClient initialProfile={initialProfile} showHeader={false} />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <p className="mb-4 text-sm text-muted-foreground">
            Actualiza tu nombre y contraseña de acceso.
          </p>
          <SettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
