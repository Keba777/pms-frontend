interface AssignBadgeProps {
  name: string;
  count: number;
}

const AssignBadge = ({ name, count }: AssignBadgeProps) => {
  return (
    <div>
      <span className="p-1 bg-cyan-700 text-white rounded-xl text-xs font-semibold">
        {count}
      </span>
      <h3 className=" text-sm font-medium mr-4">{name}</h3>
    </div>
  );
};

export default AssignBadge;
