"use client";

import { useMemo, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface MultiSelectOption {
  id: string;
  label: string;
}

interface MultiSelectSearchProps {
  options: MultiSelectOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  maxVisibleBadges?: number;
}

export function MultiSelectSearch({
  options,
  selectedIds,
  onChange,
  placeholder = "Select options",
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
  maxVisibleBadges = 2,
}: MultiSelectSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) => option.label.toLowerCase().includes(term));
  }, [options, search]);

  const selectedLabels = useMemo(() => {
    const byId = new Map(options.map((option) => [option.id, option.label]));
    return selectedIds.map((id) => byId.get(id) || id);
  }, [options, selectedIds]);

  const visibleBadges = selectedLabels.slice(0, maxVisibleBadges);
  const hiddenCount = Math.max(0, selectedLabels.length - visibleBadges.length);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between h-auto min-h-10">
          <span className="flex flex-wrap gap-1 text-left">
            {selectedLabels.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <>
                {visibleBadges.map((label) => (
                  <Badge key={label} variant="secondary">
                    {label}
                  </Badge>
                ))}
                {hiddenCount > 0 && <Badge variant="outline">+{hiddenCount} more</Badge>}
              </>
            )}
          </span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-3" align="start">
        <div className="space-y-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
          />

          <div className="max-h-56 overflow-auto rounded-md border p-2 space-y-2">
            {filteredOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground px-1 py-2">{emptyText}</p>
            ) : (
              filteredOptions.map((option) => {
                const checked = selectedIds.includes(option.id);
                return (
                  <label key={option.id} className="flex items-center gap-2 text-sm px-1">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(state) => {
                        const next = state
                          ? [...selectedIds, option.id]
                          : selectedIds.filter((id) => id !== option.id);
                        onChange(Array.from(new Set(next)));
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })
            )}
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
              disabled={selectedIds.length === 0}
            >
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
            <Button type="button" size="sm" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
