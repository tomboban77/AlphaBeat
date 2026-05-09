import author from "./author";
import insight from "./insight";
import marketNote from "./marketNote";
import sector from "./sector";
import stock from "./stock";
import etfEntry from "./etfEntry";
import weeklyPick from "./weeklyPick";
import topList from "./topList";
import sponsorship from "./sponsorship";
import siteSettings from "./siteSettings";
import legacyPost from "./post";
import legacyCategory from "./category";

// Order matters in Studio sidebar — most-edited first.
export const schemaTypes = [
  marketNote,
  weeklyPick,
  topList,
  stock,
  etfEntry,
  sector,
  insight,
  sponsorship,
  author,
  siteSettings,
  // Legacy types kept so existing Sanity documents still resolve in Studio.
  // Safe to delete once you've migrated/cleaned up old data.
  legacyPost,
  legacyCategory,
];
