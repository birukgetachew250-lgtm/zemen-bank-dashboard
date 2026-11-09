'use client';

import {
  UserCheck,
  MapPin,
  Landmark,
  FileCheck2,
  Check,
  ShieldCheck,
  Info,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type WizardStepNumber = 1 | 2 | 3 | 4;

interface StepConfig {
  step: WizardStepNumber;
  title: string;
  subtitle: string;
  Icon: typeof UserCheck;
  validationRules: string[];
  formatGuides: string[];
  regulatoryNotes: string[];
}

export const WIZARD_STEPS: StepConfig[] = [
  {
    step: 1,
    title: 'Identity & Demographics',
    subtitle: 'Core Banking CIF lookup & identity check',
    Icon: UserCheck,
    validationRules: [
      'Branch Code is mandatory (3-digit FlexCube branch code, e.g. 103).',
      'Customer ID (CIF) must match an active core banking record.',
      'Customer must not already have an active SuperApp enrollment.',
    ],
    formatGuides: [
      'CIF Format: 7-digit numeric string (e.g., 0048533).',
      'Branch Code: 3-digit numeric identifier (e.g., 101, 103).',
      'Date of Birth & Gender are synced read-only from FlexCube.',
    ],
    regulatoryNotes: [
      'NBE KYC Directive: Customer legal name and date of birth must match government-issued identification.',
      'Ensure CIF status is Open and Authorized in FlexCube prior to onboarding.',
    ],
  },
  {
    step: 2,
    title: 'Contact & Address',
    subtitle: 'Verified mobile phone, email & residence',
    Icon: MapPin,
    validationRules: [
      'Mobile Phone Number is strictly required for SMS OTP & USSD access.',
      'Email Address is required if Email OTP or Authenticator App is selected.',
      'Phone number must be uniquely bound to a single customer CIF.',
    ],
    formatGuides: [
      'Phone Format: +2519XXXXXXXX or 09XXXXXXXX (Ethiopian mobile format).',
      'Email Format: standard RFC 5322 address (e.g., name@domain.com).',
    ],
    regulatoryNotes: [
      'SIM ownership verification is mandatory before changing or registering a mobile banking phone number.',
      'All contact updates are subject to dual-control Checker verification.',
    ],
  },
  {
    step: 3,
    title: 'Accounts & Channels',
    subtitle: 'Link eligible accounts & digital channels',
    Icon: Landmark,
    validationRules: [
      'At least one active, non-frozen account must be linked for new onboarding.',
      'Blocked, closed (Record Stat C), or frozen accounts cannot be linked.',
      'Primary Authentication and 2FA methods cannot be identical.',
    ],
    formatGuides: [
      'Channels: Mobile App, USSD (*844#), or Both.',
      'Primary Auth: SMS OTP or Email OTP.',
      'Secondary 2FA: Google Authenticator, Security Question, Email OTP, or None.',
    ],
    regulatoryNotes: [
      'Joint accounts with "AND" mandate or restricted account classes are automatically blocked from self-service debit.',
    ],
  },
  {
    step: 4,
    title: 'Review & Submit',
    subtitle: 'KYC attachments & final Maker submission',
    Icon: FileCheck2,
    validationRules: [
      'Accepted attachment formats: PDF, JPG, PNG only.',
      'Maximum file size: 5MB per document.',
      'Each uploaded file must be assigned a document category.',
    ],
    formatGuides: [
      'Categories: National ID, Passport, Utility Bill, Customer Application Form, Other.',
      'Ensure scanned documents are legible and signed by the customer.',
    ],
    regulatoryNotes: [
      'Maker-Checker Policy: The submitting Maker cannot approve their own request.',
      'Checker will verify attached KYC & signed application form before activating credentials.',
    ],
  },
];

interface OnboardingWizardLayoutProps {
  currentStep: WizardStepNumber;
  onStepClick?: (step: WizardStepNumber) => void;
  maxReachableStep?: WizardStepNumber;
  title: string;
  description: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}

export function OnboardingWizardLayout({
  currentStep,
  onStepClick,
  maxReachableStep = currentStep,
  title,
  description,
  headerExtra,
  children,
}: OnboardingWizardLayoutProps) {
  const activeStepConfig =
    WIZARD_STEPS.find((s) => s.step === currentStep) || WIZARD_STEPS[0];

  return (
    <div className="w-full space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="relative pl-4 text-2xl font-extrabold tracking-tight text-foreground before:absolute before:bottom-1.5 before:left-0 before:top-1.5 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-[hsl(347,80%,50%)] before:to-[hsl(38,92%,55%)] md:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {headerExtra}
      </div>

      {/* 4-Step Stepper Bar */}
      <div className="rounded-2xl border border-border/80 bg-card/95 p-4 shadow-sm backdrop-blur">
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WIZARD_STEPS.map((item) => {
            const StepIcon = item.Icon;
            const isCompleted = item.step < currentStep;
            const isCurrent = item.step === currentStep;
            const isClickable =
              Boolean(onStepClick) && item.step <= maxReachableStep;

            return (
              <li key={item.step}>
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick?.(item.step)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200',
                    isCurrent
                      ? 'border-primary/50 bg-primary/10 shadow-sm ring-1 ring-primary/30'
                      : isCompleted
                      ? 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10'
                      : 'border-border/60 bg-muted/20 opacity-70',
                    isClickable ? 'cursor-pointer' : 'cursor-default'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors',
                      isCurrent
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Step {item.step}
                      </span>
                      {isCurrent && (
                        <Badge
                          variant="outline"
                          className="border-primary/40 bg-primary/10 px-1.5 py-0 text-[9px] text-primary"
                        >
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs font-bold text-foreground">
                      {item.title}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Main Content + Side Informational Helper Panel */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">{children}</div>

        {/* Informational Side Helper Panel */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:col-span-4">
          <Card className="overflow-hidden border-border/80 bg-card/95 shadow-sm">
            <CardHeader className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    Step {activeStepConfig.step}: {activeStepConfig.title}
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground">
                    Validation rules &amp; regulatory guide
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-4 text-xs">
              {/* Validation Rules */}
              <div>
                <h4 className="mb-2 flex items-center gap-1.5 font-bold uppercase tracking-wider text-foreground">
                  <AlertCircle className="h-3.5 w-3.5 text-primary" />
                  Field Validation Rules
                </h4>
                <ul className="space-y-1.5 text-muted-foreground">
                  {activeStepConfig.validationRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Format Guides */}
              <div className="border-t border-border/60 pt-4">
                <h4 className="mb-2 flex items-center gap-1.5 font-bold uppercase tracking-wider text-foreground">
                  <FileText className="h-3.5 w-3.5 text-amber-500" />
                  Format Guides
                </h4>
                <ul className="space-y-1.5 text-muted-foreground">
                  {activeStepConfig.formatGuides.map((guide, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>{guide}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Regulatory Requirements */}
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
                <h4 className="mb-1.5 flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Regulatory &amp; Compliance
                </h4>
                <ul className="space-y-1.5 text-muted-foreground">
                  {activeStepConfig.regulatoryNotes.map((note, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
