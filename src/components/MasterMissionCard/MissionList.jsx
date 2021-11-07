import { useStore } from "nanostores/react";

//import styles from "./MissionList.module.css";
import { intervalStore } from "@stores/intervalStore";
import { useFormattedDelta } from "@utils/hooks/useFormattedDelta";
import { useFormattedTimestamp } from "@utils/hooks/useFormattedTimestamp";

export default function MissionList({ data }) {
  const { seconds } = useStore(intervalStore);
  const delta = useFormattedDelta(data.endedAt * 1000);
  const date = useFormattedTimestamp(data.endedAt * 1000, "short");

  if (seconds && data.endedAt < seconds) return null;

  return (
    <>
      <ul>
        {data.missions
          .sort((a, b) => a.dispNo - b.dispNo)
          .map(mission => (
            <li key={mission.id}>{mission.detail}</li>
          ))}
      </ul>
      {seconds && (
        <p>
          Available until:
          <br />
          {date} ({delta})
        </p>
      )}
    </>
  );
}
