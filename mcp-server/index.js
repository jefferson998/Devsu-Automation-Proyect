#!/usr/bin/env node

require('dotenv').config({ path: './mcp-server/.env' });

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const { ClickUpClient } = require('./clickup-client');

// Initialize ClickUp client
const clickup = new ClickUpClient(process.env.CLICKUP_API_TOKEN);
const teamId = process.env.CLICKUP_TEAM_ID;
const defaultListId = process.env.CLICKUP_DEFAULT_LIST_ID;

// Create MCP server
const server = new Server(
  {
    name: 'clickup-task-manager',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'clickup_get_user',
        description: 'Get authenticated user information from ClickUp',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'clickup_get_teams',
        description: 'Get all teams/workspaces available to the user',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'clickup_get_spaces',
        description: 'Get all spaces in a team',
        inputSchema: {
          type: 'object',
          properties: {
            team_id: {
              type: 'string',
              description: 'Team ID (optional, uses env default if not provided)',
            },
          },
        },
      },
      {
        name: 'clickup_get_lists',
        description: 'Get all lists in a space',
        inputSchema: {
          type: 'object',
          properties: {
            space_id: {
              type: 'string',
              description: 'Space ID',
            },
          },
          required: ['space_id'],
        },
      },
      {
        name: 'clickup_get_tasks',
        description: 'Get tasks from a list with optional filters',
        inputSchema: {
          type: 'object',
          properties: {
            list_id: {
              type: 'string',
              description: 'List ID (optional, uses default if not provided)',
            },
            status: {
              type: 'string',
              description: 'Filter by status',
            },
            assignee: {
              type: 'string',
              description: 'Filter by assignee user ID',
            },
            limit: {
              type: 'number',
              description: 'Number of tasks to return (max 100)',
              default: 30,
            },
          },
        },
      },
      {
        name: 'clickup_get_task',
        description: 'Get detailed information about a specific task',
        inputSchema: {
          type: 'object',
          properties: {
            task_id: {
              type: 'string',
              description: 'Task ID (can be custom ID like "ABC-123")',
            },
          },
          required: ['task_id'],
        },
      },
      {
        name: 'clickup_create_task',
        description: 'Create a new task in a list',
        inputSchema: {
          type: 'object',
          properties: {
            list_id: {
              type: 'string',
              description: 'List ID (optional, uses default if not provided)',
            },
            name: {
              type: 'string',
              description: 'Task name',
            },
            description: {
              type: 'string',
              description: 'Task description (supports HTML/Markdown)',
            },
            status: {
              type: 'string',
              description: 'Initial status',
              default: 'to do',
            },
            priority: {
              type: 'number',
              description: 'Priority (1=Urgent, 2=High, 3=Normal, 4=Low)',
            },
            assignees: {
              type: 'array',
              items: { type: 'number' },
              description: 'Array of user IDs to assign',
            },
            due_date: {
              type: 'number',
              description: 'Due date as Unix timestamp (ms)',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of tag names',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'clickup_update_task',
        description: 'Update an existing task',
        inputSchema: {
          type: 'object',
          properties: {
            task_id: {
              type: 'string',
              description: 'Task ID',
            },
            name: {
              type: 'string',
              description: 'New task name',
            },
            description: {
              type: 'string',
              description: 'New task description',
            },
            status: {
              type: 'string',
              description: 'New status',
            },
            priority: {
              type: 'number',
              description: 'New priority (1=Urgent, 2=High, 3=Normal, 4=Low)',
            },
            assignees: {
              type: 'object',
              properties: {
                add: { type: 'array', items: { type: 'number' } },
                rem: { type: 'array', items: { type: 'number' } },
              },
            },
            due_date: {
              type: 'number',
              description: 'Due date as Unix timestamp (ms)',
            },
          },
          required: ['task_id'],
        },
      },
      {
        name: 'clickup_delete_task',
        description: 'Delete a task',
        inputSchema: {
          type: 'object',
          properties: {
            task_id: {
              type: 'string',
              description: 'Task ID to delete',
            },
          },
          required: ['task_id'],
        },
      },
      {
        name: 'clickup_add_comment',
        description: 'Add a comment to a task',
        inputSchema: {
          type: 'object',
          properties: {
            task_id: {
              type: 'string',
              description: 'Task ID',
            },
            comment: {
              type: 'string',
              description: 'Comment text',
            },
            notify_assignees: {
              type: 'boolean',
              description: 'Notify assignees about this comment',
              default: false,
            },
          },
          required: ['task_id', 'comment'],
        },
      },
      {
        name: 'clickup_get_comments',
        description: 'Get all comments on a task',
        inputSchema: {
          type: 'object',
          properties: {
            task_id: {
              type: 'string',
              description: 'Task ID',
            },
          },
          required: ['task_id'],
        },
      },
      {
        name: 'clickup_get_statuses',
        description: 'Get available statuses for a list',
        inputSchema: {
          type: 'object',
          properties: {
            list_id: {
              type: 'string',
              description: 'List ID',
            },
          },
          required: ['list_id'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case 'clickup_get_user':
        result = await clickup.getUser();
        break;

      case 'clickup_get_teams':
        result = await clickup.getTeams();
        break;

      case 'clickup_get_spaces': {
        const tid = args.team_id || teamId;
        if (!tid) throw new Error('Team ID is required');
        result = await clickup.getSpaces(tid);
        break;
      }

      case 'clickup_get_lists':
        result = await clickup.getLists(args.space_id);
        break;

      case 'clickup_get_tasks': {
        const listId = args.list_id || defaultListId;
        if (!listId) throw new Error('List ID is required');
        result = await clickup.getTasks(listId, {
          status: args.status,
          assignee: args.assignee,
          limit: args.limit || 30,
        });
        break;
      }

      case 'clickup_get_task':
        result = await clickup.getTask(args.task_id);
        break;

      case 'clickup_create_task': {
        const createListId = args.list_id || defaultListId;
        if (!createListId) throw new Error('List ID is required');
        
        const taskData = {
          name: args.name,
          description: args.description,
          status: args.status || 'to do',
          priority: args.priority,
          assignees: args.assignees,
          due_date: args.due_date,
          tags: args.tags,
        };
        
        // Remove undefined values
        Object.keys(taskData).forEach(key => {
          if (taskData[key] === undefined) delete taskData[key];
        });
        
        result = await clickup.createTask(createListId, taskData);
        break;
      }

      case 'clickup_update_task': {
        const updates = {
          name: args.name,
          description: args.description,
          status: args.status,
          priority: args.priority,
          assignees: args.assignees,
          due_date: args.due_date,
        };
        
        // Remove undefined values
        Object.keys(updates).forEach(key => {
          if (updates[key] === undefined) delete updates[key];
        });
        
        result = await clickup.updateTask(args.task_id, updates);
        break;
      }

      case 'clickup_delete_task':
        result = await clickup.deleteTask(args.task_id);
        break;

      case 'clickup_add_comment': {
        const assignees = args.notify_assignees ? [] : undefined;
        result = await clickup.addComment(args.task_id, args.comment, assignees);
        break;
      }

      case 'clickup_get_comments':
        result = await clickup.getComments(args.task_id);
        break;

      case 'clickup_get_statuses':
        result = await clickup.getStatuses(args.list_id);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error('Tool execution error:', error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ClickUp MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
