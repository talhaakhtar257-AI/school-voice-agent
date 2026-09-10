import { LoginForm } from "@/components/login-form";
import { OfficePhone } from "@/components/office-phone";
import { staffLoginStrings as s } from "@/lib/strings/staff-login";

/**
 * The staff sign-in screen at /login.
 *
 * At /login, not /dashboard/login, so "everything under /dashboard needs a
 * session" keeps no exception (research D-003). Laid out for a 360px screen.
 *
 * The office phone number is on this screen (FR-013), so a parent who reaches it
 * by mistake still has a route to a human (Constitution VII, assumption A-006).
 * The forgotten-password note (FR-016) is added in Phase 5 (T025).
 */
export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "22rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <h1
          dir="auto"
          style={{
            margin: 0,
            fontSize: "1.4rem",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {s.screenTitle.en}
          <br />
          {s.screenTitle.ur}
        </h1>
        <LoginForm />
        <OfficePhone />
      </div>
    </main>
  );
}
