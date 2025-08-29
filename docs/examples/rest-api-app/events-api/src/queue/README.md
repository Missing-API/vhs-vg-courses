# Queue Configuration with Google Tasks API

The queue system is implemented using the Google Tasks API, which provides a reliable way to manage asynchronous tasks and operations.

## Setup and Configuration

1. Enable the Google Tasks API:

   - Go to the [Google Cloud Console](https://console.cloud.google.com)
   - Select your project or create a new one
   - Navigate to APIs & Services > Library
   - Search for "Tasks API" and enable it

2. Configure Authentication:

   - Create credentials (OAuth 2.0 Client ID or Service Account)
   - Download the credentials JSON file
   - Set up environment variables:
     ```
     GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/credentials.json
     GOOGLE_CLOUD_PROJECT=your-project-id
     ```

3. Create a Task Queue:
   - Task queues are represented by Task Lists in Google Tasks API
   - You can create a new task list programmatically or through the API

## Usage

The queue system uses the following main operations:

- Creating tasks
- Processing tasks
- Deleting completed tasks

For detailed implementation examples, see `add-event-to-queue.ts`.

## Documentation References

- [Google Tasks API Documentation](https://developers.google.com/tasks)
- [Authentication Guide](https://cloud.google.com/docs/authentication)
- [Tasks API Reference](https://developers.google.com/tasks/reference/rest)
