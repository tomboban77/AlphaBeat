import author from "./author";
import scoreSnapshot from "./scoreSnapshot";
import digestSubscriber from "./digestSubscriber";
import stockFile from "./stockFile";
import brief from "./brief";
import playbook from "./playbook";
import rankedList from "./rankedList";
import sponsorship from "./sponsorship";
import siteSettings from "./siteSettings";
// Deprecated — kept until migration to new schemas completes
import stock from "./stock";
import weeklyPick from "./weeklyPick";
import insight from "./insight";

// Order: most-edited first
export const schemaTypes = [
  brief,
  stockFile,
  playbook,
  rankedList,
  sponsorship,
  author,
  siteSettings,
  scoreSnapshot,
  digestSubscriber,
  // Deprecated
  stock,
  weeklyPick,
  insight,
];
