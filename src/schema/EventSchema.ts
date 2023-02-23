import { z } from "zod";
import { EventAssetsDir } from "../pages/EventPage/constants";
import { normalizeDate } from "../time/normalizeDate";
import { zDate, zDuration, zDurationStrict } from "./zDate";

const Related = z.object({
  servants: z.array(z.number()).optional(),
  ces: z.array(z.number()).optional(),
  items: z.array(z.number()).optional()
});

const EventTimeDate = Related.extend({ title: z.string(), date: zDate });
const EventTimeDuration = Related.extend({
  title: z.string(),
  date: zDuration
});

const EventSchedule = z.object({
  title: z.string(),
  description: z.string().optional(),
  times: z
    .array(EventTimeDate)
    .transform(times => times.sort((a, b) => a.date - b.date)),
  ends: zDate.optional(),
  icon: z.string().optional()
});

const EventBanner = Related.omit({ items: true })
  .extend({ date: zDurationStrict })
  .transform(({ date, ...props }, { addIssue }) => {
    if (Array.isArray(date)) return { date, ...props };
    addIssue({
      code: z.ZodIssueCode.custom,
      message: "Banner Duration must contain end date"
    });
    return z.NEVER;
  });

export const EventSchema = z.object({
  title: z.string(),
  shortTitle: z.string().max(50),
  banner: z.string().regex(/\d{4}_[a-z0-9_-]+\.png/),
  date: zDuration,
  url: z.string(),
  requires: z.string().optional(),
  description: z.string(),
  schedules: z
    .array(EventSchedule)
    .transform(schedules =>
      schedules
        .filter(schedule => schedule.times.length > 0)
        .sort((_a, _b) => {
          const a: number = _a.times[0].date;
          const b: number = _b.times[0].date;
          return a - b;
        })
    )
    .optional(),
  times: z
    .array(z.union([EventTimeDate, EventTimeDuration]))
    .transform(times =>
      times.sort((_a, _b) => {
        const [a] = normalizeDate(_a.date);
        const [b] = normalizeDate(_b.date);
        return a - b;
      })
    )
    .optional(),
  banners: z
    .array(EventBanner)
    .transform(banners => banners.sort((a, b) => a.date[0] - b.date[0]))
    .optional(),
  upgrades: z.array(z.number()).optional()
});

export type EventDataRaw = Partial<z.input<typeof EventSchema>>;
export type EventDataParsed = z.output<typeof EventSchema>;

export function checkEventPath(path: string): boolean {
  const reg = new RegExp(`${EventAssetsDir}/[\\w-]+\\.yml$`);
  return reg.test(path);
}
