import { useContext } from "react";
import { createContext } from "react";
import type {
  BundledServant,
  BundledNP,
  BundledSkill
} from "src/servants/types";
import type { BundledCE, BundledItem } from "src/items/types";
import type { BundledQuest } from "src/upgrades/types";

export type DataMap<T> = Record<number, T>;

export type ServantMap = DataMap<BundledServant>;
const servantContext = createContext<ServantMap>({});
export const ServantContext = servantContext.Provider;
export const useServantMap = () => useContext(servantContext);

export type SkillMap = DataMap<BundledSkill>;
const skillContext = createContext<SkillMap>({});
export const SkillContext = skillContext.Provider;
export const useSkillMap = () => useContext(skillContext);

export type NPMap = DataMap<BundledNP>;
const npContext = createContext<NPMap>({});
export const NPContext = npContext.Provider;
export const useNPMap = () => useContext(npContext);

export type QuestMap = DataMap<BundledQuest>;
const questContext = createContext<QuestMap>({});
export const QuestContext = questContext.Provider;
export const useQuestMap = () => useContext(questContext);

export type CEMap = DataMap<BundledCE>;
const ceContext = createContext<CEMap>({});
export const CEContext = ceContext.Provider;
export const useCEMap = () => useContext(ceContext);

export type ItemMap = DataMap<BundledItem>;
const itemContext = createContext<ItemMap>({});
export const ItemContext = itemContext.Provider;
export const useItemMap = () => useContext(itemContext);

interface Maps {
  servants: ServantMap;
  skills: SkillMap;
  nps: NPMap;
  quests: QuestMap;
  ces: CEMap;
  items: ItemMap;
}

export type WithMaps<Keys extends keyof Maps> = Pick<Maps, Keys>;
