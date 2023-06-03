import { DataContext } from "~/client/contexts";
//import { SpecialTimer } from "~/components/SpecialTimer";
import { CardGrid } from "~/components/Card";
import { Clocks } from "~/components/Clocks";
import { EventList } from "~/components/EventList";
import Headline from "~/components/Headline";
import Meta from "~/components/Meta";
import { NoSSR } from "~/components/NoSSR";
import ChaldeaGateCard from "~/pages/HomePage/components/ChaldeaGateCard";
import { LoginInfoCard } from "~/pages/HomePage/components/LoginInfoCard";
import MasterMissionCard from "~/pages/HomePage/components/MasterMissionCard";
import { ShopsInfoCard } from "~/pages/HomePage/components/ShopsInfoCard";
// import styles from "~/pages/HomePage/HomePage.module.css";
// import type { HomePageProps } from "~/pages/HomePage/static";

export { getStaticProps } from "~/pages/HomePage/static";
// FIX ME: old code that still has no getBundle fn, also need a workaround for the API Cache
export const config = {
  unstable_includeFiles: [
    ".next/cache/atlasacademy/info.json",
    ".next/cache/atlasacademy/NA/nice_master_mission.json"
  ]
};

export default function HomePage({
  events,
  loginTicket,
  items,
  milestones,
  masterMissions,
  shops
}) {
  return (
    <>
      <Meta
        title="FGO Timers"
        description="Timers for Fate/Grand Order Global Version"
        noTitleSuffix
      />
      <Clocks />
      {/*<NoSSR>
        <SpecialTimer
          startsAt={1668901500000}
          text={"Fate/Grand Order Anime NYC 2022 Panel"}
          icon={"/assets/icon_game.png"}
        />
      </NoSSR>*/}
      {events.length > 0 && <EventList events={events} />}
      <Headline>Timers</Headline>
      <CardGrid>
        <DataContext items={items}>
          <LoginInfoCard ticket={loginTicket} milestones={milestones} />
        </DataContext>
        <MasterMissionCard data={masterMissions} />
        <NoSSR>
          <ChaldeaGateCard />
        </NoSSR>
        <ShopsInfoCard shops={shops} />
      </CardGrid>
    </>
  );
}
