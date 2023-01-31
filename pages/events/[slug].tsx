import type { EventPageProps } from "src/pages/EventPage/static";
import { CardGrid } from "src/client/components/Card";
import { EventTimesCard } from "src/pages/EventPage/components/EventTimesCard";
import { EventSchedulesCard } from "src/pages/EventPage/components/EventSchedulesCard";
import { EventPageLayout } from "src/pages/EventPage/components/EventPageLayout";
import styles from "src/pages/EventPage/EventPage.module.css";

// Next Page configs
export { getStaticPaths, getStaticProps } from "src/pages/EventPage/static";
export const config = {
  unstable_includeFiles: [
    "assets/static/events.json",
    "assets/static/data/servants.json",
    "assets/static/data/ces.json"
  ]
};

export default function EventPage({
  event,
  servants,
  ces,
  items
}: EventPageProps) {
  const end = Array.isArray(event.date) ? event.date[1] : event.date;
  const hasGrid = Boolean(event.schedules || event.times);

  return (
    <EventPageLayout event={event} current="Timers">
      {hasGrid ? (
        <CardGrid className={styles.cardgrid}>
          {event.times && (
            <EventTimesCard
              times={event.times}
              servants={servants}
              ces={ces}
              items={items}
            />
          )}
          {event.schedules?.map(schedule => (
            <EventSchedulesCard
              key={schedule.title}
              {...schedule}
              eventEnd={end}
              servants={servants}
              ces={ces}
              items={items}
            />
          ))}
        </CardGrid>
      ) : (
        "This Event has no timers"
      )}
    </EventPageLayout>
  );
}
