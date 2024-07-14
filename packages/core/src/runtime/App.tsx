import { Layout } from "@theme";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

interface AppProps {
  helmetContext?: object;
}

export function App(props: AppProps) {
  return (
    <HelmetProvider context={props?.helmetContext}>
      <BrowserRouter><Layout /></BrowserRouter>
    </HelmetProvider>
  );
}
