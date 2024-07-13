import { hydrateRoot, createRoot } from "react-dom/client";
import { App } from "./App";

const isProduction = process.env.NODE_ENV === "production";

export async function renderInBrowser() {
  const container = document.getElementById("root");

  const app = <App />;

  if (isProduction) {
    hydrateRoot(container, app);
  } else {
    createRoot(container).render(app);
  }
}
