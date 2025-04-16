import ClientActivityResourcesPage from "./ClientActivityResourcesPage";
import apiClient from "@/services/api-client";
import { Activity } from "@/types/activity";

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  try {
    const res = await apiClient.get<{ success: boolean; data: Activity[] }>(
      "activities"
    );
    const activities = res.data.data;
    return activities.map((activity) => ({
      id: activity.id.toString(),
    }));
  } catch (error) {
    console.error("Error generating static params for activities:", error);
    return [];
  }
}

export default async function ActivityPage(segmentData: { params: Params }) {
  const params = await segmentData.params;
  const { id } = params;
  return <ClientActivityResourcesPage activityId={id} />;
}
