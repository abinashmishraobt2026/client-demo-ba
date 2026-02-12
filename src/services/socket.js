// STATIC DEMO VERSION - Mock WebSocket service for GitHub Pages
// No real-time connections - simulated for demo purposes

/**
 * Mock WebSocket service - maintains same API as real socket service
 * All methods are no-ops or return mock data
 */
class MockSocketService {
  constructor() {
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect() {
    // Simulate connection in demo mode
    this.isConnected = true;
    console.log('[Mock Socket] Connected (Demo mode)');
    return null;
  }

  disconnect() {
    this.isConnected = false;
    this.listeners.clear();
    console.log('[Mock Socket] Disconnected');
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error('[Mock Socket] Listener error:', error);
        }
      });
    }
  }

  send(event, data) {
    // No-op in demo mode
    console.log('[Mock Socket] Send (no-op):', event, data);
  }

  joinUserRoom(userId) {
    // No-op in demo mode
  }

  joinAdminRoom() {
    // No-op in demo mode
  }

  leaveRooms() {
    // No-op in demo mode
  }

  isSocketConnected() {
    return this.isConnected;
  }
}

const socketService = new MockSocketService();

export default socketService;
