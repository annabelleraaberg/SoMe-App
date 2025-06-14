import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { enUS } from "date-fns/locale"; // eller `nb` hvis du vil bruke norsk

export function formatPostDate(date: Date): string {
  // differenceInDays based on date-fns documentation: https://date-fns.org/v4.1.0/docs/differenceInDays
  const daysAgo = differenceInDays(new Date(), date);

  // formatDistanceToNow based on date-fns documentation: https://date-fns.org/v4.1.0/docs/formatDistanceToNow
  if (daysAgo < 7) {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: enUS,
    });
  }

  return format(date, "d. MMMM yyyy", {
    locale: enUS,
  });
}
