import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socket';
import { isAuthenticated, getUserId, isAdmin } from '../utils/auth';

export const useSocket = () => {
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated()) {
      // Connect to socket
      socketRef.current = socketService.connect();
      
      if (socketRef.current) {
        const userId = getUserId();
        
        // Join appropriate rooms
        socketService.joinUserRoom(userId);
        
        if (isAdmin()) {
          socketService.joinAdminRoom();
        }
      }
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketService.leaveRooms();
        socketService.disconnect();
      }
    };
  }, []);

  return socketService;
};

export const useSocketEvent = (event, callback, deps = []) => {
  const socket = useSocket();

  useEffect(() => {
    if (socket && callback) {
      socket.on(event, callback);
      
      return () => {
        socket.off(event, callback);
      };
    }
  }, [socket, event, callback, ...deps]);

  return socket;
};

export default useSocket;