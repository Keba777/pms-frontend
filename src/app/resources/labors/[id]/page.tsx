import React from "react";
import ClientLaborDetail from "./ClientLaborDetail";
import apiClient from "@/services/api-client";
import { Site } from "@/types/site";

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  try {
    const res = await apiClient.get<{ success: boolean; data: Site[] }>(
      "sites"
    );
    const sites = res.data.data;
    return sites.map((site) => ({
      id: site.id.toString(),
    }));
  } catch (error) {
    console.error("Error generating static params for labor sites:", error);
    return [];
  }
}

export default async function LaborPage(segmentData: { params: Params }) {
  const params = await segmentData.params;
  const { id } = params;
  return <ClientLaborDetail siteId={id} />;
}
