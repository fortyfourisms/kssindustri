import { useQuery } from "@tanstack/react-query";
import { perusahaanService } from "@/services/perusahaan.service";
import { useUser } from "@/hooks/useAuth";
import type { CurrentUser } from "@/stores/auth.store";

const COMPANY_STALE_TIME = 1000 * 60 * 5;

export function useCompanyProfile(providedUser?: CurrentUser | null) {
    const userQuery = useUser();
    const user = providedUser ?? userQuery.data;

    const perusahaanId = user?.id_perusahaan || user?.perusahaan?.id;
    const embeddedPerusahaan = user?.perusahaan ?? null;
    const shouldFetchPerusahaan = !!perusahaanId && !embeddedPerusahaan?.nama_perusahaan;

    const perusahaanQuery = useQuery({
        queryKey: ["perusahaan", perusahaanId],
        queryFn: () => perusahaanService.getById(String(perusahaanId)),
        enabled: shouldFetchPerusahaan,
        initialData: embeddedPerusahaan || undefined,
        initialDataUpdatedAt: embeddedPerusahaan ? Date.now() : undefined,
        staleTime: COMPANY_STALE_TIME,
    });

    return {
        user,
        userQuery,
        perusahaanId,
        perusahaan: perusahaanQuery.data ?? embeddedPerusahaan,
        perusahaanQuery,
        shouldFetchPerusahaan,
    };
}
