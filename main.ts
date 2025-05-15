import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "shopify-mcp",
  version: "1.0.0",
  schema: z.object({
    shopifyAccessToken: z.string(),
    shopifyStore: z.string(),
  }),
});

server.tool(
  "fetch-products",
  "Fetch products from a given shopify store",
  {
    product: z.string().describe("the product to fetch"),
  },
  async ({ product }) => {
    return {
      content: [
        {
          type: "text",
          text: `The product is ${product}`,
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);