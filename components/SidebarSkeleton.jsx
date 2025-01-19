// components/SidebarSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "./ui/sidebar";

const SidebarSkeleton = () => (
    <Sidebar>

  <div className="w-64 h-full p-4">
    <Skeleton className="h-8 w-full mb-4" />
    <Skeleton className="h-6 w-3/4 mb-2" />
    <Skeleton className="h-6 w-1/2 mb-2" />
    <Skeleton className="h-6 w-5/6 mb-2" />
    <Skeleton className="h-6 w-2/3 mb-2" />
  </div>
    </Sidebar>
);

export default SidebarSkeleton;
