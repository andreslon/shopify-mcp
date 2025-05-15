import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

// Define types for Shopify GraphQL response
interface ShopifyGraphQLResponse {
  data?: {
    products?: {
      edges?: Array<{
        node: {
          id: string;
          title: string;
          handle: string;
          descriptionHtml?: string;
          productType?: string;
          vendor?: string;
          tags?: string[];
          status?: string;
          featuredImage?: {
            url: string;
            altText?: string;
          };
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
      pageInfo?: {
        hasNextPage: boolean;
      };
    };
  };
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

// Fixed Shopify store and access token values
const SHOPIFY_STORE = "....myshopify.com";
const SHOPIFY_ACCESS_TOKEN = "";

const server = new McpServer({
  name: "shopify-mcp",
  version: "1.0.0"
});

server.tool(
  "fetch-products",
  "Fetch products from a given shopify store",
  {
    product: z.string().describe("the product to fetch"),
  },
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
                edges {
                  node {
                    id
                    title
                    handle
                    descriptionHtml
                    productType
                    vendor
                    tags
                    status
                    featuredImage {
                      url
                      altText
                    }
                    variants(first: 3) {
                      edges {
                        node {
                          id
                          title
                          sku
                          price
                          inventoryQuantity
                        }
                      }
                    }
                  }
                }
                pageInfo {
                  hasNextPage
                }
              }
            }
          `,
          variables: {
            searchQuery: product
          }
        })
      });

      const data = await response.json() as ShopifyGraphQLResponse;
      
      if (data.errors) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching products: ${JSON.stringify(data.errors)}`,
            },
          ],
        };
      }

      const products = data.data?.products?.edges?.map(edge => edge.node) || [];
      
      if (products.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No products found matching "${product}"`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Found ${products.length} products matching "${product}":`,
          },
          {
            type: "text",
            text: JSON.stringify(products, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error fetching products: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);