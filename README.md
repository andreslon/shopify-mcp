# Shopify MCP

A Model Context Protocol (MCP) server for interacting with Shopify stores. This project allows AI assistants to fetch product information from Shopify using the MCP standard.

## Features

- Fetch product information from Shopify stores
- Built with the Model Context Protocol SDK
- TypeScript implementation with Zod validation

## Installation

```bash
# Install dependencies
npm install

# Or using pnpm (recommended)
pnpm install
```

## Configuration

The server requires the following parameters:
- `shopifyAccessToken`: Your Shopify API access token
- `shopifyStore`: Your Shopify store URL (e.g., your-store.myshopify.com)

## Usage

```bash
# Run the server directly with tsx
npx tsx .\main.ts

# Run with the MCP inspector
npx @modelcontextprotocol/inspector npx -y tsx main.ts
```

## Available Tools

### fetch-products

Fetches product information from a Shopify store.

Parameters:
- `product`: The product name or ID to fetch

## Development

```bash
# Install dependencies
pnpm install

# Run the server during development
npx tsx .\main.ts
```

## License

ISC