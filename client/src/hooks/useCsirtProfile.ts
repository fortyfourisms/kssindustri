// hooks/useCsirtProfile.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export function useCsirtProfile() {
    const { toast } = useToast();
    const qc = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: FormData) => api.createCsirt(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["csirt"] });
            toast({ title: "CSIRT ditambahkan" });
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormData }) => api.updateCsirt(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["csirt"] });
            toast({ title: "CSIRT diperbarui" });
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteCsirt(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["csirt"] });
            toast({ title: "CSIRT dihapus" });
        },
        onError: (e: any) => toast({ title: "Gagal", description: e.message, variant: "destructive" }),
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
    };
}