
import { UserActionClient } from "@/components/users/UserActionClient";

export default function SuspendUserPage() {
  return (
    <div className="w-full space-y-8">
      <UserActionClient action="Suspend" />
    </div>
  );
}
