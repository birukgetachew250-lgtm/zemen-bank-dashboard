
import { UserActionClient } from "@/components/users/UserActionClient";

export default function ResetPasswordPage() {
  return (
    <div className="w-full space-y-8">
      <UserActionClient action="ResetPassword" />
    </div>
  );
}
