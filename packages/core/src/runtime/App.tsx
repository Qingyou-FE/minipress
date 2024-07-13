import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";

interface AppProps {
  helmetContext?: object;
}

export function App(props: AppProps) {
  return (
    <HelmetProvider context={props?.helmetContext}>
      <BrowserRouter>123</BrowserRouter>
    </HelmetProvider>
  );
}
