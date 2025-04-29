import React from "react";
import ClientEditRole from "./ClientEditRole";
import apiClient from "@/services/api-client";
import { Role } from "@/types/user";

//–– 1) Scope your params to a plain object, not a Promise
type RoleParams = { id: string };

//–– 2) generateStaticParams must return an array of { id } objects
export async function generateStaticParams(): Promise<RoleParams[]> {
  const response = await apiClient.get<{ success: boolean; data: Role[] }>(
    "/api/roles"
  );
  const payload = response.data;

  if (!payload.success) {
    return [];
  }

  return payload.data.map((role) => ({
    // ensure it’s a string
    id: (role.id ?? "").toString(),
  }));
}

//–– 3) Your actual page component takes { params } and returns JSX
//    Notice: it’s now *synchronous* (no `async`), so TS sees it returns JSX, not a Promise.
export default function Page({ params }: { params: RoleParams }) {
  return <ClientEditRole roleId={params.id} />;
}
