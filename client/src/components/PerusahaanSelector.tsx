import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface PerusahaanSelectorProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export function PerusahaanSelector({ value, onChange, error }: PerusahaanSelectorProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const { data: companies = [], isLoading } = useQuery({
        queryKey: ["perusahaanDropdown"],
        queryFn: api.getPerusahaanDropdown,
    });

    const getName = (c: any): string => c.nama_perusahaan || c.name || "";
    const getId = (c: any): string => String(c.id ?? "");

    const selectedPerusahaan = companies.find((c) => getId(c) === value);
    const displayLabel = selectedPerusahaan
        ? getName(selectedPerusahaan)
        : "Select company...";

    const filteredCompanies = companies.filter((c) =>
        getName(c).toLowerCase().includes(search.toLowerCase())
    );

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
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
