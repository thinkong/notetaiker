import { RPCSchema } from "electrobun/bun";

export type AppRPCType = {
  bun: RPCSchema<{
    requests: {};
    messages: {};
  }>;
  webview: RPCSchema<{
    requests: {};
    messages: {};
  }>;
};
