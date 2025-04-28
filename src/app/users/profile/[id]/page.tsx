import apiClient from "@/services/api-client";
import { User } from "@/types/user";
import ClientProfileDetail from "./ClientProfileDetail";

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  try {
    const res = await apiClient.get<{ success: boolean; data: User[] }>(
      "users"
    );
    const users = res.data.data;

    return users.map((user) => ({
      id: user.id.toString(),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function UserPage(segmentData: { params: Params }) {
  const params = await segmentData.params;
  const { id } = params;
  return <ClientProfileDetail userId={id} />;
}
