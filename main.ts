import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

// Simple type for product data
type Product = {
  id: string;
  title: string;
  handle: string;
  descriptionHtml?: string;
  productType?: string;
  vendor?: string;
  tags?: string[];
  status?: string;
  featuredImage?: { url: string; altText?: string };
  variants?: Array<{ id: string; title: string; sku?: string; price: string; inventoryQuantity?: number }>;
};

// Type for GraphQL response
type ShopifyResponse = {
  data?: {
    products?: {
      edges?: Array<{
        node: {
          id: string;
          title: string;
          handle: string;
          descriptionHtml?: string;
          productType?: string;
          onlineStorePreviewUrl?: string;
          vendor?: string;
          tags?: string[];
          status?: string;
          featuredImage?: { url: string; altText?: string };
          variants?: {
            edges?: Array<{
              node: {
                id: string;
                title: string;
                sku?: string;
                price: string;
                inventoryQuantity?: number;
              };
            }>;
          };
        };
      }>;
    };
  };
  errors?: Array<{ message: string }>;
};

const SHOPIFY_STORE = ".myshopify.com";
const SHOPIFY_ACCESS_TOKEN = "";

const server = new McpServer({ name: "shopify-mcp", version: "1.0.0" });

server.tool(
  "fetch-products",
  "Fetch products from a given shopify store",
  { product: z.string().describe("the product to fetch") },
  async ({ product }) => {
    try {
      const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2025-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
        },
        body: JSON.stringify({
          query: `
            query AdminSearchProducts($searchQuery: String!) {
              products(first: 10, query: $searchQuery) {
                edges { node {
                  id title handle descriptionHtml productType onlineStorePreviewUrl vendor tags status
                  featuredImage { url altText }
                  variants(first: 3) { edges { node { id title sku price inventoryQuantity } } }
                }}
              }
            }
          `,
          variables: { searchQuery: product }
        })
      });

      const data = await response.json() as ShopifyResponse;
      
      if (data.errors) {
        return { content: [{ type: "text", text: `Error: ${JSON.stringify(data.errors)}` }] };
      }

      // Transform and simplify the products data
      const products: Product[] = (data.data?.products?.edges || []).map(edge => {
        const node = edge.node;
        return {
          ...node,
          variants: node.variants?.edges?.map(v => v.node) || []
        };
      });
      
      return {
        content: [{
          type: "text", 
          text: products.length > 0 
            ? `Found ${products.length} products:\n${JSON.stringify(products, null, 2)}`
            : `No products found matching "${product}"`
        }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }] };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);