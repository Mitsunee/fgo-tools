import readline from "readline";
import { dedent } from "@foxkit/util/dedent";
import type { Servant } from "@atlasacademy/api-connector/dist/Schema/Servant";
import type { CraftEssenceBasic } from "@atlasacademy/api-connector/dist/Schema/CraftEssence";
import type { Item } from "@atlasacademy/api-connector/dist/Schema/Item";
import picocolors from "picocolors";
import { Searcher } from "fast-fuzzy";
import type { MatchData } from "fast-fuzzy";
import { atlasCacheJP } from "../atlas-api/cache";
import { Log } from "./log";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const dd = dedent({ tabWidth: 4, trim: true, useTabs: false });

function readlinePrompt(prompt: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(`${prompt}: `, answer => {
      console.log();
      resolve(answer);
    });
  });
}

function prettyprintMatch(match: MatchData<any>) {
  const text = match.original;
  const { index, length } = match.match;
  const end = index + length;
  const before = text.slice(0, index);
  const matched = text.slice(index, end);
  const after = text.substring(end);

  return `${before}${picocolors.bold(matched)}${after}`;
}

enum Menu {
  SELECT = 1,
  SERVANT,
  CE,
  ITEM
}

type MenuFn = () => Promise<boolean>;
type SearcherOpts<T> = {
  keySelector: (candidate: T) => string;
  returnMatchData: true;
  threshold?: number;
};

async function menuSelectMenu(): Promise<false | Menu> {
  console.log(
    dd(`
      Select Entity Type:
        1) Servant
        2) Craft Essence
        3) Item
    `)
  );
  const input = await readlinePrompt("Option (1-3)");
  switch (input) {
    case "1":
      return Menu.SERVANT;
    case "2":
      return Menu.CE;
    case "3":
      return Menu.ITEM;
    default:
      return false;
  }
}

const menuFindServant: MenuFn = (() => {
  let cache: Servant[];
  let searcher: Searcher<Servant, SearcherOpts<Servant>>;

  return async function menuFindServant() {
    cache ??= await atlasCacheJP.getNiceServant();
    searcher ??= new Searcher(cache, {
      keySelector: candidate => candidate.name,
      returnMatchData: true,
      threshold: 0.7
    });

    const input = await readlinePrompt("Search Servant by Name");
    if (!input) return false;

    const results = searcher.search(input);
    for (const result of results) {
      const name = prettyprintMatch(result);
      console.log(
        `  - [${result.item.id}]: ${name} (${result.item.rarity}* ${result.item.className})`
      );
    }

    console.log();
    return true;
  };
})();

const menuFindCE: MenuFn = (() => {
  let cache: CraftEssenceBasic[];
  let searcher: Searcher<CraftEssenceBasic, SearcherOpts<CraftEssenceBasic>>;

  return async function menuFindCE() {
    cache ??= await atlasCacheJP.getBasicCE();
    searcher = new Searcher(cache, {
      keySelector: candidate => candidate.name,
      returnMatchData: true,
      threshold: 0.75
    });

    const input = await readlinePrompt("Search CE by Name");
    if (!input) return false;

    const results = searcher.search(input);
    for (const result of results) {
      const name = prettyprintMatch(result);
      console.log(`  - [${result.item.id}]: ${name}`);
    }

    console.log();
    return true;
  };
})();

const menuFindItem: MenuFn = (() => {
  let cache: Item[];
  let searcher: Searcher<Item, SearcherOpts<Item>>;

  return async function menuFindItem() {
    cache ??= await atlasCacheJP.getNiceItem();
    searcher ??= new Searcher(cache, {
      keySelector: candidate => candidate.name,
      returnMatchData: true,
      threshold: 0.75
    });

    const input = await readlinePrompt("Search Item by Name");
    if (!input) return false;

    const results = searcher.search(input);
    for (const result of results) {
      const name = prettyprintMatch(result);
      console.log(`  - [${result.item.id}]: ${name}`);
    }

    console.log();
    return true;
  };
})();

async function main() {
  let menu: Menu | false = Menu.SELECT;

  while (menu) {
    switch (menu) {
      case Menu.SELECT: {
        menu = await menuSelectMenu();
        break;
      }
      case Menu.SERVANT: {
        const res = await menuFindServant();
        if (!res) menu = Menu.SELECT;
        break;
      }
      case Menu.CE: {
        const res = await menuFindCE();
        if (!res) menu = Menu.SELECT;
        break;
      }
      case Menu.ITEM: {
        const res = await menuFindItem();
        if (!res) menu = Menu.SELECT;
        break;
      }
      default: {
        Log.error("Unknown menu selected");
        return false;
      }
    }
  }
}

(async () => {
  let status: 0 | 1 = 0;
  try {
    const res: any = await main();
    if (res === false) status = 1;
    if (res instanceof Error) {
      Log.error(res);
      status = 1;
    }
  } catch (e) {
    Log.error(e);
    status = 1;
  } finally {
    rl.close();
    process.exit(status);
  }
})();
