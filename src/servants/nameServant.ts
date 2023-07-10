import type { ServantWithLore } from "@atlasacademy/api-connector/dist/Schema/Servant";
import { getNiceServantsFull } from "~/atlas-api/cache/data/niceServant";
import { Log } from "~/utils/log";
import { nameServantClass } from "./classNames";

const baseNameCache = new Map<number, string>();

let niceServant: ServantWithLore[];
let niceServantNA: ServantWithLore[];

function stripClassSuffix(name: string): string {
  return name
    .replace(
      / \((?:Saber|Archer|Lancer|Rider|Caster|Assassin|Berserker|Ruler|Avenger|Moon Cancer|Alter(?: |-)Ego|Foreigner|Pretender)\)/i,
      "" // dunno if there's a nicer way to do this
    )
    .replace(/ Alter/, " (Alter)")
    .trim()
    .replace(/ {2,}/g, " ");
}

/**
 * Memoized method to get spoilersafe name of Servant without class suffix and parenthesizes "Alter" suffix
 *
 * For example this will turn "Altria Pendragon Alter (Lancer)" into "Altria Pendragon (Alter)"
 *
 * @param servant Servant object from API
 * @returns string
 */
function getBaseName(servant: ServantWithLore): string {
  let cached = baseNameCache.get(servant.id);

  if (!cached) {
    cached = stripClassSuffix(
      servant.ascensionAdd?.overWriteServantName?.ascension?.["0"] ||
        servant.name
    );
    baseNameCache.set(servant.id, cached);
  }

  return cached;
}

/**
 * Determines the spoilersafe name of a servant, using class suffix only if needed to be as unambiguous as possible.
 *
 * A Special case for BB (and Summer BB) is made where 4* BB is called "BB" and
 * 5* BB is called "BB (Summer)" as they both have the same class. This matches
 * the existing naming scheme for Abigail Williams who also has a same-class
 * summer version (of the same rarity even)
 *
 * @param servantId id of Servant
 * @returns string
 */
export async function nameServant(servantId: number): Promise<string> {
  niceServant ??= await getNiceServantsFull("JP");
  niceServantNA ??= await getNiceServantsFull("NA");

  const servant = niceServant.find(servant => servant.id == servantId);
  if (!servant) {
    Log.throw(`Could not find servant with id ${servantId}`);
  }
  const servantNA = niceServantNA.find(servantNA => servantNA.id == servantId);

  const baseName = getBaseName(servantNA || servant);
  let overrideName: string | undefined;

  if (
    niceServant.filter(servant => getBaseName(servant) == baseName).length > 1
  ) {
    overrideName = `${baseName} (${nameServantClass(servant.className)})`;
  }

  if (baseName == "BB") {
    overrideName = `BB${servant.rarity == 4 ? "" : " (Summer)"}`;
  }

  return overrideName || baseName;
}
