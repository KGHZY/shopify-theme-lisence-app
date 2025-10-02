import { redirect } from "@remix-run/node";

export const loader = async () => {
  // Redirect to license management page when accessing /app
  return redirect("/app/license");
};
