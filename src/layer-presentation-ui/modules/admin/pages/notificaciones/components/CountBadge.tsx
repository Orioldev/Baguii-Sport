


export const CountBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  return (
    <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
      {count}
    </span>
  );
}