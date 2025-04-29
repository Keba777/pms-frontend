import React from "react";
import ClientEditRole from "./ClientEditRole";

type Params = Promise<{ id: string }>;

export default async function EditRolePage(segmentData: { params: Params }) {
  const params = await segmentData.params;
  const { id } = params;

  return <ClientEditRole roleId={id} />;
}
