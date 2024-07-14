import { hydrateRoot, createRoot } from "react-dom/client";
import { App } from "./App";

const isProduction = process.env.NODE_ENV === "production";

export async function renderInBrowser() {
  const app = <App />;
  const container = document.getElementById("root");

  if (!container) {
    throw new Error('#root element not found')
  }

  if (isProduction) {
    hydrateRoot(container, app);
  } else {
    createRoot(container).render(app);
  }
}

renderInBrowser();