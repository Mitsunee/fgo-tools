import { join } from "path";
import { EntityType } from "@atlasacademy/api-connector/dist/Schema/Entity.js";
import { List } from "@foxkit/util/object";
import { atlasCache } from "../../atlas-api/cache";
import { shortenAtlasUrl } from "../../atlas-api/urls";
import { mapServantRarityToBorder } from "../../servants/borders";
import { nameServant } from "../../servants/nameServant";
import { getAvailabilityMap } from "../../utils/availabilityMaps";
import { Log } from "../../utils/log";
import type { BundledServant } from "../../servants/types";
import type { DataBundler } from "../utils/dataBundlers";

const avMapPath = join("assets", "data", "servants", "availability.yml");

export const bundleServantsData: DataBundler<BundledServant> = async ids => {
  const [basicServant, basicServantNA, availabilityMap] = await Promise.all([
    atlasCache.JP.getBasicServant(),
    atlasCache.NA.getBasicServant(),
    getAvailabilityMap(avMapPath)
  ]);

  if (!availabilityMap) {
    Log.error(`Could not find availability map at '${avMapPath}'`);
    return false;
  }

  const servantQueue = List.fromArray([...ids]); // to be processed
  const res = new Map<number, BundledServant>(); // result of processing

  while (servantQueue.length > 0) {
    const servantId = servantQueue.shift()!;
    const servant = basicServant.find(servant => servant.id == servantId);
    if (!servant || servant.type == EntityType.ENEMY_COLLECTION_DETAIL) {
      Log.error(`Could not find servant id ${servantId}`);
      return false;
    }

    const servantNA = basicServantNA.find(servant => servant.id == servantId);
    const name = await nameServant(servant.id);
    const availability = availabilityMap.match(servantId);
    const data: BundledServant = {
      name,
      icon: shortenAtlasUrl(servant.face),
      classId: servant.className,
      border: mapServantRarityToBorder(servant.rarity),
      rarity: servant.rarity
    };

    if (servantNA) data.na = true;
    if (availability) data.availability = availability;

    res.set(servantId, data);
  }

  Log.info(`Mapped data for ${res.size} Servants`);
  return {
    name: "Servants",
    path: "servants.json",
    data: res
  };
};
