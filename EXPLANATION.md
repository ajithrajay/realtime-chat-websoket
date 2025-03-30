# Implementation Details

## Thought Process
- **Backend:** Used Node.js with the `ws` WebSocket library to manage real-time communication. Implemented Express for authentication and MongoDB for storing chat history.
- **Frontend:** Used React to create an interactive UI with WebSocket integration. Managed state with `useState` and handled WebSocket events using `useEffect`.

## Challenges & Solutions
1. **Handling WebSocket Reconnection:**  
   - Issue: When the WebSocket disconnected, users had to refresh the page.  
   - Solution: Implemented automatic reconnection logic that retries connecting if the WebSocket closes.

2. **Private Messaging:**  
   - Issue: Need to deliver messages only to intended users.  
   - Solution: Maintained an object that maps usernames to WebSocket connections.

3. **Chat History Storage:**  
   - Issue: Messages would be lost after server restart.  
   - Solution: Used MongoDB to store messages and retrieve the last 10 messages when a user joins.

## Potential Improvements
- Add user presence indicators (online/offline status).
- Improve UI/UX with animations and notifications.
- Implement group chat functionality.

