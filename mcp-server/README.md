# AI Form Builder — MCP Server

Connect any MCP-compatible AI agent (Claude Desktop, Cursor, Continue, etc.) to the AI Form Builder. Generate complete forms from a prompt and write production-ready Vue / React / Angular components directly to your project.

## Quick Setup (2 minutes)

### 1. Create an account

Open the form builder web app and register with email + password. Verify your email — the AI generation tools require a verified account.

### 2. Add the MCP server to your AI agent

#### Claude Desktop

Open the config file:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Add this entry (merge with any existing `mcpServers`):

```json
{
  "mcpServers": {
    "form-builder": {
      "url": "https://<your-deployment>.vercel.app/api/mcp"
    }
  }
}
```

Restart Claude Desktop. You should see "form-builder" listed under available tools.

#### Cursor / Continue / other clients

Use the same URL — `https://<your-deployment>.vercel.app/api/mcp` — wherever the client accepts an MCP HTTP endpoint.

### 3. Use it

Inside Claude Desktop:

> Log in to form-builder with email **you@example.com** and password **••••••**, then generate a contact form and save it as `ContactForm.vue` in my project.

The agent will call three tools in sequence: `authenticate` → `generate_form` → `generate_code`, then write the file.

---

## Available Tools

| Tool | Purpose |
|------|---------|
| `authenticate` | Sign in with email + password, returns a Firebase ID token (1-hour expiry). |
| `generate_form` | Generate a single-page or multi-step form schema from a natural language prompt. |
| `generate_code` | Convert a form schema into a Vue 3 SFC, React TSX, or Angular component. |
| `list_forms` | List all saved single-page forms for the authenticated user. |
| `get_form` | Get the full schema of a saved single-page form. |
| `list_multistep_forms` | List all saved multi-step forms. |
| `get_multistep_form` | Get the full schema of a saved multi-step form. |

## Limits

- **Daily quota:** 2 form generations per user per UTC day. Resets at 00:00 UTC.
- **Token lifetime:** 1 hour. Re-authenticate if you get an auth error.
- **Email verification:** Required before using `generate_form`.

## Smart Layout

The AI groups related short fields into rows automatically (e.g., First/Last name, City/ZIP, Day/Month/Year). The schema returned by `generate_form` matches the same structure used by the web builder, so anything generated via MCP is editable in the visual builder later.

## Privacy

- Your password is sent only to Firebase Auth, never stored on the MCP server.
- Generated forms are saved in your private Firestore namespace — no other user can access them.
- The MCP server holds no per-user state between requests (stateless deployment).

---

## Self-Hosting (Advanced)

If you'd rather run the MCP server locally instead of using the hosted URL:

1. Clone the repo, run `npm install`.
2. Copy `.env.local.example` to `.env.local` and fill in:
   - `GEMINI_API_KEY` (free at https://aistudio.google.com/apikey)
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (Firebase Console → Project Settings → Service Accounts)
3. Use stdio transport in your client config:
   ```json
   {
     "mcpServers": {
       "form-builder": {
         "command": "node",
         "args": [
           "--import", "tsx/esm",
           "--env-file=/absolute/path/to/.env.local",
           "/absolute/path/to/mcp-server/index.ts"
         ]
       }
     }
   }
   ```

Local self-hosting requires your own Firebase project and Gemini API key. The hosted URL above doesn't.
