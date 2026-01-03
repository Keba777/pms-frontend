import { Trash2, Search, RefreshCw, ChevronDown } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

interface TopBarActionsProps {
  refetch: () => void;
}

const TopBarActions = ({ refetch }: TopBarActionsProps) => {
  return (
    <div className="flex items-center justify-between p-4">
      {/* Delete Button */}
      <div className="flex gap-4">
        <button className="flex items-center px-4 py-2 rounded-lg gap-2 text-destructive hover:text-destructive-foreground hover:bg-destructive border border-destructive">
          <Trash2 size={18} /> Delete Selected
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search"
            className="pl-10 pr-4 py-2 border border-border rounded bg-background text-foreground"
          />
        </div>

        {/* Filter Menu */}
        <Menu>
          <MenuButton className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90">
            <button onClick={() => refetch()} className="rounded">
              <RefreshCw size={14} />
            </button>
            <ChevronDown size={14} />
          </MenuButton>

          <MenuItems className="absolute right-0 mt-2 w-48 bg-white border border-border rounded shadow-lg z-10">
            <MenuItem>
              {({ focus }) => (
                <label
                  className={`flex items-center px-4 py-2 whitespace-nowrap ${focus ? "bg-accent" : ""
                    }`}
                >
                  <input type="checkbox" className="mr-2" checked readOnly />
                  Activity
                </label>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <label
                  className={`flex items-center px-4 py-2 whitespace-nowrap ${focus ? "bg-accent" : ""
                    }`}
                >
                  <input type="checkbox" className="mr-2" checked readOnly />
                  Priority
                </label>
              )}
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </div>
  );
};

export default TopBarActions;
