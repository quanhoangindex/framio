"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            className={cn(
                "peer inline-flex h-[19px] w-8 shrink-0 items-center rounded-full border border-transparent bg-[#0d0d0d] shadow-xs transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-[linear-gradient(270deg,rgb(101,158,169)_0%,rgb(221,188,101)_35.577%,rgb(0,146,173)_65.865%,rgb(69,166,172)_100%)]",
                className,
            )}
            {...props}>
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className="pointer-events-none block size-[15px] translate-x-0.5 rounded-full bg-white shadow-sm ring-0 transition-transform data-checked:translate-x-[15px]"
            />
        </SwitchPrimitive.Root>
    );
}

export { Switch };
