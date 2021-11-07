import { useState } from "react";

import { basename, extname } from "path";
import { getEventFileList } from "@utils/server/events/getEventFileList";
import { resolveFilePath } from "@utils/server/resolveFilePath";
import { parseEventFile } from "@utils/server/events/parseEventFile";

import styles from "@styles/EventPage.module.css";
import { useInterval } from "@utils/hooks/useInterval";
import Meta from "@components/Meta";
import Headline from "@components/Headline";
import Section from "@components/Section";
import { InfoTable } from "@components/InfoTable";
import EventTimeRow from "@components/EventTimeRow";
import Modal from "@components/Modal";
import { Button } from "@components/Button";
import { IconClose } from "@components/icons";

export default function EventPage({
  title,
  shortTitle,
  banner,
  url,
  startsAt,
  endsAt = null,
  times = [],
  description
}) {
  const interval = useInterval(1000);
  const [showModal, setShowModal] = useState(false);

  const handleModalOpen = event => {
    event.preventDefault();
    setShowModal(true);
  };

  return (
    <>
      <Meta
        title={title}
        headerTitle="Events"
        image={`/banners/${banner}`}
        description={`Event Timers for ${title}${
          description ? `. ${description[0].slice(0, 150)}...` : ""
        }`}
        headerDescription={`Event Timers for ${shortTitle}`}
      />
      <div className={styles.header}>
        <a
          href={`https://webview.fate-go.us/${url}`}
          onClick={handleModalOpen}
          target="_blank"
          rel="noreferrer noopener">
          <img src={`/banners/${banner}`} alt={title} />
          <div className={styles.hint}>Click to see the official News Post</div>
        </a>
      </div>
      <Headline>{title}</Headline>
      {description && (
        <Section background>
          {description.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </Section>
      )}
      <InfoTable background className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th>#</th>
            <th>in</th>
            <th>at</th>
          </tr>
        </thead>
        <tbody>
          <EventTimeRow
            title={startsAt > interval ? "Starts" : "Started"}
            interval={interval}
            target={startsAt}
          />
          {endsAt !== null && (
            <EventTimeRow
              title={endsAt > interval ? "Ends" : "Ended"}
              interval={interval}
              target={endsAt}
            />
          )}
          {times.map((time, idx) => {
            // handle rotating times
            if (time.times) {
              let next = time.times.find(({ startsAt }) => startsAt > interval);
              if (!next && time.hideWhenDone) return null;
              if (!next) {
                next = time.times[time.times.length - 1];
              }

              return (
                <EventTimeRow
                  key={idx}
                  title={next.title}
                  interval={interval}
                  target={next.startsAt}
                />
              );
            }

            // skip finished times where hideWhenDone is set
            if (
              time.hideWhenDone &&
              ((time.endsAt && interval > time.endsAt) ||
                (!time.endsAt && interval > time.startsAt))
            ) {
              return null;
            }

            return (
              <EventTimeRow
                key={idx}
                title={time.title}
                interval={interval}
                target={
                  time.startsAt > interval
                    ? time.startsAt
                    : time.endsAt || time.startsAt
                }
              />
            );
          })}
        </tbody>
      </InfoTable>
      {showModal && (
        <Modal>
          <div className={styles.iframeWrapper}>
            <iframe src={`https://webview.fate-go.us/iframe/${url}`} />
            <Button
              className={styles.close}
              iconComponent={IconClose}
              onClick={() => setShowModal(false)}
            />
          </div>
        </Modal>
      )}
    </>
  );
}

export async function getStaticPaths() {
  const fileList = await getEventFileList();
  const paths = fileList.map(file => ({
    params: {
      slug: basename(file, extname(file))
    }
  }));

  return {
    paths,
    fallback: false
  };
}

export async function getStaticProps(context) {
  const slug = context.params.slug;
  const filePath = resolveFilePath(`assets/data/events/${slug}.yml`);
  const { title, shortTitle, banner, url, startsAt, ...data } =
    await parseEventFile(filePath);
  const props = { title, shortTitle, banner, url, startsAt };

  if (typeof data.endsAt !== "undefined") {
    props.endsAt = data.endsAt;
  }

  if (typeof data.times !== "undefined") {
    props.times = data.times;
  }

  if (typeof data.description !== "undefined") {
    props.description = data.description
      .trim()
      .replace(/\n{2,}/gm, "\n")
      .split("\n");
  }

  return { props };
}
