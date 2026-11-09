import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[96px] w-full rounded-xl border border-input bg-background/90 text-foreground px-3.5 py-2.5 text-base shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-border placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary/60 focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
