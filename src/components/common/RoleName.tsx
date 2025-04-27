import { useRole } from "@/hooks/useRoles";

const RoleName: React.FC<{ roleId: string }> = ({ roleId }) => {
  const { data: role, isLoading, isError } = useRole(roleId);

  if (isLoading) return <>Loading…</>;
  if (isError || !role) return <>N/A</>;
  return <>{role.name}</>;
};

export default RoleName;
