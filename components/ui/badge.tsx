import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className = '', variant = 'default', ...props }, ref) => {
        const variants = {
            default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
            secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
            destructive: "border-transparent bg-destructive/15 text-destructive hover:bg-destructive/25",
            outline: "text-foreground",
            success: "border-transparent bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25",
            warning: "border-transparent bg-amber-500/15 text-amber-500 hover:bg-amber-500/25",
            info: "border-transparent bg-blue-500/15 text-blue-500 hover:bg-blue-500/25",
        };

        return (
            <span
                ref={ref}
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}
                {...props}
            />
        );
    }
);

Badge.displayName = "Badge";
