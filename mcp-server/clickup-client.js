const axios = require('axios');

class ClickUpClient {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.baseURL = 'https://api.clickup.com/api/v2';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': apiToken,
        'Content-Type': 'application/json'
      }
    });
  }

  // Get authenticated user info
  async getUser() {
    const response = await this.client.get('/user');
    return response.data.user;
  }

  // Get teams
  async getTeams() {
    const response = await this.client.get('/team');
    return response.data.teams;
  }

  // Get spaces in a team
  async getSpaces(teamId) {
    const response = await this.client.get(`/team/${teamId}/space`);
    return response.data.spaces;
  }

  // Get folders in a space
  async getFolders(spaceId) {
    const response = await this.client.get(`/space/${spaceId}/folder`);
    return response.data.folders;
  }

  // Get lists in a space (excluding lists in folders)
  async getLists(spaceId) {
    const response = await this.client.get(`/space/${spaceId}/list`);
    return response.data.lists;
  }

  // Get lists in a folder
  async getFolderLists(folderId) {
    const response = await this.client.get(`/folder/${folderId}/list`);
    return response.data.lists;
  }

  // Get tasks from a list
  async getTasks(listId, filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('statuses[]', filters.status);
    if (filters.assignee) params.append('assignees[]', filters.assignee);
    if (filters.dueDateLt) params.append('due_date_lt', filters.dueDateLt);
    if (filters.dueDateGt) params.append('due_date_gt', filters.dueDateGt);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const queryString = params.toString();
    const url = `/list/${listId}/task${queryString ? '?' + queryString : ''}`;
    
    const response = await this.client.get(url);
    return response.data.tasks;
  }

  // Get a single task
  async getTask(taskId) {
    const response = await this.client.get(`/task/${taskId}`);
    return response.data;
  }

  // Create a task
  async createTask(listId, taskData) {
    const response = await this.client.post(`/list/${listId}/task`, taskData);
    return response.data;
  }

  // Update a task
  async updateTask(taskId, updates) {
    const response = await this.client.put(`/task/${taskId}`, updates);
    return response.data;
  }

  // Delete a task
  async deleteTask(taskId) {
    const response = await this.client.delete(`/task/${taskId}`);
    return response.data;
  }

  // Add comment to task
  async addComment(taskId, commentText, assignees = []) {
    const response = await this.client.post(`/task/${taskId}/comment`, {
      comment_text: commentText,
      assignees
    });
    return response.data;
  }

  // Get task comments
  async getComments(taskId) {
    const response = await this.client.get(`/task/${taskId}/comment`);
    return response.data.comments;
  }

  // Get task statuses
  async getStatuses(listId) {
    const response = await this.client.get(`/list/${listId}/status`);
    return response.data.statuses;
  }
}

module.exports = { ClickUpClient };
