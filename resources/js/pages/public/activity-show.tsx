import { ActivityPage } from "@/features/activities/pages";
import type { Locale, Activity } from "@/types/content";
export default function Page({
    locale,
    activity,
}: {
    locale: Locale;
    activity: Activity;
}) {
    return <ActivityPage locale={locale} activity={activity} />;
}
