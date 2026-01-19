
import { UserActionClient } from "@/components/users/UserActionClient";

export default function UnlockUserPage() {
  return (
    <div className="w-full space-y-8">
      <UserActionClient action="Unlock" />
    </div>
  );
}
