import { Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LogoutConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isPending?: boolean;
    description: string;
}

export function LogoutConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    isPending = false,
    description,
}: LogoutConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="dashboard-modal-panel w-full max-w-md rounded-3xl border p-6 shadow-2xl">
                <AlertDialogHeader className="space-y-2 text-left">
                    <AlertDialogTitle className="text-xl font-bold text-[var(--dashboard-text)]">
                        Konfirmasi Logout
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm leading-6 text-[var(--dashboard-text-soft)]">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3 sm:space-x-0">
                    <AlertDialogCancel
                        disabled={isPending}
                        className="dashboard-secondary-button mt-0 rounded-xl border px-5 text-[var(--dashboard-text)] hover:text-[var(--dashboard-text)]"
                    >
                        Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isPending}
                        className="rounded-xl border-0 bg-rose-600 px-5 text-white shadow-[0_18px_38px_rgba(225,29,72,0.28)] hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                    >
                        {isPending ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Logout...
                            </span>
                        ) : (
                            "Ya, Logout"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
