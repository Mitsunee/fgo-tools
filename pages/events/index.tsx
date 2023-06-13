import { useEffect, useMemo, useState } from "react";
import { clamp } from "@foxkit/util/clamp";
import { useStore } from "@nanostores/react";
import { Searcher, sortKind } from "fast-fuzzy";
//import { api } from "~/client/api";
import { settingsStore } from "~/client/stores/settingsStore";
import { EventList } from "~/components/EventList";
import Headline from "~/components/Headline";
import { Input } from "~/components/Input";
import Meta from "~/components/Meta";
import { Scroller } from "~/components/Scroller";
import Section from "~/components/Section";
import type { EventsPageProps } from "~/pages/EventsPage/static";
import styles from "~/pages/EventsPage/EventsPage.module.css";

export { getStaticProps } from "~/pages/EventsPage/static";

export default function EventsPage({
  active,
  fallback /*,now */
}: EventsPageProps) {
  const { perPage } = useStore(settingsStore);
  /* const query = api.events.basic.useQuery(
    { exclude: "active", now },
    {
      placeholderData: fallback,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false
    }
  ); */
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const events = fallback; //query.data ?? fallback;
  const isLoading = false; //query.isLoading || !query.data;
  const isError = false; //query.isError;

  // create searcher
  const searcher = useMemo(() => {
    return new Searcher(events, {
      keySelector: event => [event.title, event.shortTitle],
      threshold: 0.9,
      sortBy: sortKind.insertOrder
    });
  }, [events]);

  // apply search
  const results = searchQuery == "" ? events : searcher.search(searchQuery);
  const firstResultNum = Math.min(1, results.length);
  const lastResultNum = Math.min(page * perPage, results.length);
  const maxPage = Math.ceil(results.length / perPage);

  // reset page if filters or search changed
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // make sure page is valid if perPage setting is changed
  useEffect(() => {
    setPage(page =>
      clamp({
        value: page,
        max: maxPage
      })
    );
  }, [perPage, maxPage]);

  // action handlers
  const handleShowMore = () => {
    setPage(page =>
      clamp({
        value: page + 1,
        max: maxPage
      })
    );
  };

  if (isError) {
    return (
      <Section background>
        <Headline>Internal Server Error</Headline>
        <p>An Error occured while fetching the data for this page</p>
      </Section>
    );
  }

  return (
    <>
      <Meta
        title="Events"
        description="List of current and past events of Fate/Grand Order Global Version"
      />
      <Section background>
        <b>Note:</b> We are currently experiencing server issues and data
        fetching has been disabled temporarily, meaning this page does not
        currently have all data available to it. Thank you for your
        understanding.
      </Section>
      <EventList events={active} title="Current Events" loading="eager" />
      <EventList events={results.slice(0, page * perPage)} title="Past Events">
        <div className={styles.search}>
          <p>
            Results {firstResultNum} to {lastResultNum} of {results.length}
          </p>
          {!isLoading && (
            <Input
              value={searchQuery}
              type="search"
              onChange={ev => setSearchQuery(ev.target.value)}
              placeholder="Search"
            />
          )}
        </div>
      </EventList>
      <p>
        Results {firstResultNum} to {lastResultNum} of {results.length}
      </p>
      {!isLoading && page < maxPage && (
        <Scroller
          handler={handleShowMore}
          handlerMax={() => setPage(maxPage)}
        />
      )}
    </>
  );
}
