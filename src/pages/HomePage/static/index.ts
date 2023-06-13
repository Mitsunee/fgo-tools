import type { GetStaticPropsResult, InferGetStaticPropsType } from "next";
import { serverApi } from "~/server/api/root";
import * as Legacy from "~/server/HomePage";
import { msToSeconds } from "~/time/msToSeconds";
import { getBundledItemMap } from "~/utils/getBundles";
import { getLoginTicketProps } from "./getLoginTicketProps";
import { getMilestoneProps } from "./getMilestoneProps";
import { getShopInfoProps } from "./getShopInfoProps";

export const getStaticProps = async () => {
  const now = msToSeconds(Date.now());
  const [legacyProps, itemMap, events, loginTicket, milestones, shops] =
    await Promise.all([
      Legacy.getStaticProps(),
      getBundledItemMap(),
      serverApi.events.basic.fetch({ exclude: "inactive", now }),
      getLoginTicketProps(now),
      getMilestoneProps(now),
      getShopInfoProps(now)
    ]);

  const itemIds = new Set<number>([...loginTicket.items]);
  const items: typeof itemMap = {};

  for (const id of itemIds) {
    items[id] = itemMap[id];
  }

  const props = {
    ...legacyProps,
    events,
    loginTicket,
    items,
    milestones,
    shops
  };
  const res: GetStaticPropsResult<typeof props> = {
    props /* revalidate: 3600  */
  };
  return res;
};

export type HomePageProps = InferGetStaticPropsType<typeof getStaticProps>;
