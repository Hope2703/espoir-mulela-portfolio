import type { Activity } from "@/types/content";
import { includeEntry } from "@/lib/content-policy";

export const activityEntries: Activity[] = [];
export const getActivities = () => activityEntries.filter(includeEntry);
