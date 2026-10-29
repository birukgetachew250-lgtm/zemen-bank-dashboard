"use client"

import * as React from "react"
import { CheckCircle2, AlertTriangle, Info, XOctagon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

type Tone = "default" | "info" | "success" | "warning" | "destructive"

const ICONS: Record<Tone, React.ReactNode> = {
  default: <Info className="h-[18px] w-[18px]" />,
  info: <Info className="h-[18px] w-[18px]" />,
  success: <CheckCircle2 className="h-[18px] w-[18px]" />,
  warning: <AlertTriangle className="h-[18px] w-[18px]" />,
  destructive: <XOctagon className="h-[18px] w-[18px]" />,
}

/** Existing calls only pass default/destructive – infer a richer tone from the wording. */
function inferTone(variant: string | null | undefined, text: string): Tone {
  if (variant === "destructive" || variant === "success" || variant === "warning" || variant === "info") return variant
  const t = text.toLowerCase()
  if (/(fail|error|invalid|denied|unable|could not|cannot|rejected)/.test(t)) return "destructive"
  if (/(warn|pending|expire|attention|caution|required|missing)/.test(t)) return "warning"
  if (/(success|approved|created|saved|updated|submitted|sent|linked|unlinked|reset|completed|deleted|activated|logging out|done)/.test(t)) return "success"
  return "info"
}

const textOf = (n: React.ReactNode): string =>
  typeof n === "string" ? n : typeof n === "number" ? String(n) : ""

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={5500} swipeDirection="right">
      {toasts.map(function ({ id, title, description, action, variant, duration, ...props }) {
        const tone = inferTone(variant, `${textOf(title)} ${textOf(description)}`)
        const ms = duration ?? 5500
        return (
          <Toast key={id} variant={tone} duration={ms} {...props}>
            {/* tone accent edge */}
            <span className="absolute inset-y-0 left-0 w-1 bg-[hsl(var(--tone))]" />
            <span className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-[hsl(var(--tone)/0.18)] blur-2xl" />
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--tone)/0.12)] text-[hsl(var(--tone))] ring-1 ring-[hsl(var(--tone)/0.25)]">
              {ICONS[tone]}
            </div>
            <div className="relative grid flex-1 gap-0.5 pt-0.5">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
              {action && <div className="mt-2">{action}</div>}
            </div>
            <ToastClose />
            {/* countdown progress */}
            <span className="absolute inset-x-0 bottom-0 h-[3px] bg-slate-100/70">
              <span
                className="block h-full origin-left bg-[hsl(var(--tone))] group-hover:[animation-play-state:paused]"
                style={{ animation: `toast-progress ${ms}ms linear forwards` }}
              />
            </span>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}