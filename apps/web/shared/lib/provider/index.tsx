import { ReactQueryProvider } from "./react-query";

export function Provider({ children }: { children: React.ReactNode }) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}
