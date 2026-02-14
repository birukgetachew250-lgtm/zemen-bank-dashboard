
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, ArrowRight, CornerDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const stepTypes = ['input', 'lookup', 'validation', 'confirmation', 'payment', 'otp', 'pin', 'biometric', 'success', 'error', 'receipt'];

export function SDUIFlowDesigner({ providerId, initialSteps }: { providerId: string, initialSteps: any[] }) {
  const [steps, setSteps] = useState(initialSteps);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Payment Journey</CardTitle>
          <CardDescription>Sequence of screens and actions for this provider.</CardDescription>
        </div>
        <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Step</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
            No steps defined. Click "Add Step" to begin building the flow.
          </div>
        ) : (
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent dark:before:via-slate-700">
            {steps.map((step, idx) => (
              <div key={step.StepId} className="relative flex items-center justify-between p-4 bg-background border rounded-lg shadow-sm ml-10 animate-in slide-in-from-left-4 fade-in">
                <div className="absolute -left-10 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold border-4 border-background z-10 text-xs">
                  {step.StepOrder}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="uppercase text-[10px]">{step.StepType}</Badge>
                    <h4 className="font-bold">{step.Title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.Subtitle}</p>
                  {step.ApiEndpoint && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-mono bg-muted p-1 px-2 rounded">
                      <Badge variant="secondary" className="text-[9px]">{step.ApiMethod}</Badge>
                      {step.ApiEndpoint}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {step.NextStepOnSuccess && (
                    <div className="flex items-center text-xs text-green-600 bg-green-50 p-1 px-2 rounded border border-green-100">
                      Success <ArrowRight className="h-3 w-3 mx-1" /> Step {step.NextStepOnSuccess}
                    </div>
                  )}
                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
