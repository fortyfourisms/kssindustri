import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, Search, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const PERUSAHAAN_NEW = "NEW";

interface PerusahaanSelectorProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    /**
     * Called when user confirms a new company name in the modal.
     * The parent should send `nama_perusahaan` in the register payload instead of `id_perusahaan`.
     */
    onNewName?: (name: string) => void;
    newName?: string;
}

export function PerusahaanSelector({ value, onChange, error, onNewName, newName = "" }: PerusahaanSelectorProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [draftName, setDraftName] = useState("");

    const { data: companies = [], isLoading } = useQuery({
        queryKey: ["perusahaanDropdown"],
        queryFn: api.getPerusahaanDropdown,
    });

    const getName = (c: any): string => c.nama_perusahaan || c.name || "";
    const getId = (c: any): string => String(c.id ?? "");

    const isNew = value === PERUSAHAAN_NEW;
    const selectedPerusahaan = companies.find((c) => getId(c) === value);

    const displayLabel = isNew
        ? (newName || "New company...")
        : selectedPerusahaan
            ? getName(selectedPerusahaan)
            : "Select company...";

    const filteredCompanies = companies.filter((c) =>
        getName(c).toLowerCase().includes(search.toLowerCase())
    );

    const confirmNewCompany = () => {
        if (!draftName.trim()) return;
        onChange(PERUSAHAAN_NEW);
        onNewName?.(draftName.trim());
        setShowModal(false);
        setDraftName("");
    };

    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Company Name</label>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between rounded-xl border-slate-200 bg-white/80 h-11 px-3.5 font-normal text-sm hover:bg-white hover:border-slate-300 transition-all",
                            !value && "text-slate-400",
                            isNew && "text-blue-600",
                            error && "border-red-500 ring-1 ring-red-500/20"
                        )}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                                <span>Loading...</span>
                            </div>
                        ) : (
                            displayLabel
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl border-slate-200 shadow-xl overflow-hidden"
                    align="start"
                >
                    <Command shouldFilter={false}>
                        <div className="flex items-center border-b border-slate-100 px-3">
                            <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
                            <input
                                placeholder="Search your company name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
                            />
                        </div>
                        <CommandList className="max-h-[200px] overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 text-center text-sm text-slate-500">Loading data...</div>
                            ) : (
                                <>
                                    <CommandGroup>
                                        {filteredCompanies.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-slate-500">
                                                No results.
                                            </div>
                                        ) : (
                                            filteredCompanies.map((company) => (
                                                <div
                                                    key={getId(company)}
                                                    onClick={() => {
                                                        onChange(getId(company));
                                                        onNewName?.("");
                                                        setOpen(false);
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-slate-50"
                                                >
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                                        value === getId(company) ? "bg-blue-500" : "bg-transparent"
                                                    )} />
                                                    <span className="flex-1 text-sm text-slate-700">{getName(company)}</span>
                                                    {value === getId(company) && (
                                                        <Check className="h-4 w-4 text-blue-500" />
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </CommandGroup>
                                </>
                            )}
                        </CommandList>

                        {/* "Tambah Perusahaan Baru" — opens a modal to type the name.
                            No POST /api/perusahaan needed; parent sends nama_perusahaan in register payload. */}
                        {!isLoading && (
                            <div className="p-2 flex items-center justify-center gap-3 border-t border-slate-100 bg-slate-50/50">
                                <p className="text-xs text-slate-500 font-medium">Haven't found your company?</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDraftName(newName);
                                        setOpen(false);
                                        setShowModal(true);
                                    }}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                                        isNew
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-blue-600 hover:bg-blue-50"
                                    )}
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add Now
                                    {isNew && <Check className="h-3.5 w-3.5 ml-1" />}
                                </button>
                            </div>
                        )}
                    </Command>
                </PopoverContent>
            </Popover>

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

            {/* Modal — shown when user clicks "Tambah Perusahaan Baru" */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-md rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            Add New Company
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Company Name
                        </label>
                        <Input
                            placeholder="Enter company name"
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && confirmNewCompany()}
                            className="rounded-xl border-slate-200 h-11"
                            autoFocus
                        />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setShowModal(false)}
                            className="rounded-xl text-slate-500"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={!draftName.trim()}
                            onClick={confirmNewCompany}
                            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 px-6"
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
