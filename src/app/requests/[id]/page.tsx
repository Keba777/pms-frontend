import React from "react";
import ClientRequestDetail from "./ClientRequestDetail";
import apiClient from "@/services/api-client";
import { Request } from "@/types/request";

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  try {
    const res = await apiClient.get<{ success: boolean; data: Request[] }>(
      "requests"
    );
    const requests = res.data.data;
    return requests.map((request) => ({
      id: request.id.toString(),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function ProjectPage(segmentData: { params: Params }) {
  const params = await segmentData.params;
  const { id } = params;
  return <ClientRequestDetail requestId={id} />;
}
