import { formatMoney } from "@/lib/booking";
import { cn } from "@/lib/cn";

type PriceProps = {
  amount: number;
  suffix?: string;
  className?: string;
};

export function Price({ amount, suffix = "/ night", className }: PriceProps) {
  return (
    <p className={cn("leading-none", className)}>
      <span className="price-value">{formatMoney(amount)}</span>
      {suffix ? <span className="price-suffix">{suffix}</span> : null}
    </p>
  );
}
