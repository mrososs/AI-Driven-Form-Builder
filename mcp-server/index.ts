import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js'

import { authenticate } from './tools/auth.ts'
import { generateForm } from './tools/generate.ts'
import { generateCode } from './tools/codegen.ts'
import { listForms, getForm, listMultiStepForms, getMultiStepForm } from './tools/forms.ts'

const TOOLS: Tool[] = [
  {
    name: 'authenticate',
    description:
      'Sign in with email and password to get a Firebase ID token. ' +
      'Call this first — the token is required by all other tools that access user data or AI generation. ' +
      'Tokens expire after 1 hour, so re-authenticate if you get an auth error.',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'User email address' },
        password: { type: 'string', description: 'User password' },
      },
      required: ['email', 'password'],
    },
  },
  {
    name: 'generate_form',
    description:
      'Generate a complete form schema from a natural language prompt using Gemini AI. ' +
      'Returns a JSON schema ready for code generation. Requires a valid Firebase token. ' +
      'Daily limit: 2 generations per user (resets at 00:00 UTC). ' +
      'The user account must have a verified email.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description:
            'Natural language description of the form. ' +
            'Examples: "A job application form with personal info, work experience and skills", ' +
            '"A multi-step user registration wizard with account setup, profile, and confirmation".',
        },
        mode: {
          type: 'string',
          enum: ['single', 'multistep'],
          description:
            '"single" — one-page form with a flat list of fields. ' +
            '"multistep" — wizard with 3–6 themed steps. Default: "single".',
        },
        token: {
          type: 'string',
          description: 'Firebase ID token from the authenticate tool.',
        },
      },
      required: ['prompt', 'token'],
    },
  },
  {
    name: 'generate_code',
    description:
      'Convert a form schema (from generate_form) into a production-ready component. ' +
      'Supports Vue 3 SFC, React TSX, and Angular. ' +
      'The returned code can be written directly to a file.',
    inputSchema: {
      type: 'object',
      properties: {
        elements: {
          type: 'array',
          description: 'The "elements" array from a generate_form single result.',
          items: { type: 'object' },
        },
        title: {
          type: 'string',
          description: 'Form title — used to name the component (e.g., "Contact Form" → ContactForm.vue).',
        },
        framework: {
          type: 'string',
          enum: ['vue', 'react', 'angular'],
          description: 'Target framework for code generation.',
        },
      },
      required: ['elements', 'title', 'framework'],
    },
  },
  {
    name: 'list_forms',
    description: 'List all single-page forms saved by the authenticated user.',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Firebase ID token from the authenticate tool.' },
      },
      required: ['token'],
    },
  },
  {
    name: 'get_form',
    description: 'Get the full schema of a saved single-page form by ID.',
    inputSchema: {
      type: 'object',
      properties: {
        form_id: { type: 'string', description: 'Form ID from list_forms.' },
        token: { type: 'string', description: 'Firebase ID token from the authenticate tool.' },
      },
      required: ['form_id', 'token'],
    },
  },
  {
    name: 'list_multistep_forms',
    description: 'List all multi-step forms saved by the authenticated user.',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Firebase ID token from the authenticate tool.' },
      },
      required: ['token'],
    },
  },
  {
    name: 'get_multistep_form',
    description: 'Get the full schema of a saved multi-step form by ID, including all steps and fields.',
    inputSchema: {
      type: 'object',
      properties: {
        form_id: { type: 'string', description: 'Form ID from list_multistep_forms.' },
        token: { type: 'string', description: 'Firebase ID token from the authenticate tool.' },
      },
      required: ['form_id', 'token'],
    },
  },
]

const server = new Server(
  { name: 'ai-form-builder', version: '1.0.0' },
  { capabilities: { tools: {} } },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params

  try {
    switch (name) {
      case 'authenticate': {
        const token = await authenticate(args.email as string, args.password as string)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, token, message: 'Authentication successful. Use this token in other tools.' }),
            },
          ],
        }
      }

      case 'generate_form': {
        const mode = (args.mode as 'single' | 'multistep' | undefined) ?? 'single'
        const result = await generateForm(args.prompt as string, mode, args.token as string)
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        }
      }

      case 'generate_code': {
        const result = generateCode({
          elements: args.elements as Parameters<typeof generateCode>[0]['elements'],
          title: args.title as string,
          framework: args.framework as 'vue' | 'react' | 'angular',
        })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ filename: result.filename, language: result.language, code: result.code }),
            },
          ],
        }
      }

      case 'list_forms': {
        const forms = await listForms(args.token as string)
        return {
          content: [{ type: 'text', text: JSON.stringify(forms, null, 2) }],
        }
      }

      case 'get_form': {
        const form = await getForm(args.form_id as string, args.token as string)
        return {
          content: [{ type: 'text', text: JSON.stringify(form, null, 2) }],
        }
      }

      case 'list_multistep_forms': {
        const forms = await listMultiStepForms(args.token as string)
        return {
          content: [{ type: 'text', text: JSON.stringify(forms, null, 2) }],
        }
      }

      case 'get_multistep_form': {
        const form = await getMultiStepForm(args.form_id as string, args.token as string)
        return {
          content: [{ type: 'text', text: JSON.stringify(form, null, 2) }],
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
      isError: true,
    }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  // Silence stdout — MCP uses it for protocol messages only
  process.stderr.write('AI Form Builder MCP server running on stdio\n')
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err instanceof Error ? err.message : String(err)}\n`)
  process.exit(1)
})
