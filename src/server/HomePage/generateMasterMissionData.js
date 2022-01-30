import { fetchJson } from "@foxkit/node-util/fetch";
import { isClamped } from "foxkit/clamp";

import { getCurrentTime } from "../utils/getCurrentTime";
import { createServerError } from "../utils/createServerError";
import { parseMasterMission } from "../utils/parseMasterMission";

export async function generateMasterMissionData() {
  const now = getCurrentTime();
  const parsedData = new Object();
  const res = await fetchJson(
    "https://api.atlasacademy.io/export/NA/nice_master_mission.json"
  );
  if (!res) {
    throw createServerError("Could not reach Atlas Academy API");
  }

  // find weekly master missions
  const weeklyData = res.find(({ missions, startedAt, endedAt }) => {
    if (missions[0].type !== "weekly") return false;
    if (isClamped({ value: now, min: startedAt, max: endedAt })) return true;
    return false;
  });
  if (!weeklyData) {
    throw createServerError("Could not find Weekly Master Missions");
  }
  parsedData.weekly = parseMasterMission(weeklyData);

  const limitedData = res.filter(({ missions, startedAt, endedAt }) => {
    if (missions[0].type !== "limited") return false;
    if (isClamped({ value: now, min: startedAt, max: endedAt })) return true;
    return false;
  });
  if (limitedData.length > 0) {
    const parsedMissions = new Array();
    for (const limitedMission of limitedData) {
      parsedMissions.push(parseMasterMission(limitedMission));
    }

    parsedData.limited = parsedMissions;
  }

  return parsedData;
}
