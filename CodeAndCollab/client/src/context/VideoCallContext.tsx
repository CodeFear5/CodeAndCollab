import { createContext, useContext, useState, useRef, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { SocketEvent } from "@/types/socket";
import { useAppContext } from "@/context/AppContext";

export interface User {
  username: string;
  socketId: string;
  roomId: string;
}

interface VideoCallContextType {
  isCalling: boolean;
  startCall: () => void;
  stopCall: () => void;
  localStream: MediaStream | null;
  remoteUsers: User[];
  addRemoteUser: (user: User) => void;
  removeRemoteUser: (socketId: string) => void;
}

const VideoCallContext = createContext<VideoCallContextType | undefined>(
  undefined
);

export const VideoCallProvider = ({ children }: { children: React.ReactNode }) => {
  const { socket } = useSocket();
  const { currentUser } = useAppContext();

  const [isCalling, setIsCalling] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<User[]>([]);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on(SocketEvent.VIDEO_CALL_PERMISSION, (user: User) => {
      setRemoteUsers((prev) =>
        prev.some((u) => u.socketId === user.socketId) ? prev : [...prev, user]
      );
    });

    socket.on(SocketEvent.VIDEO_CALL_REJECTED, (user: User) => {
      alert(`${user.username} rejected the video call.`);
    });

    return () => {
      socket.off(SocketEvent.VIDEO_CALL_PERMISSION);
      socket.off(SocketEvent.VIDEO_CALL_REJECTED);
    };
  }, [socket]);

  const startCall = async () => {
    if (!socket || !currentUser?.roomId) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit(SocketEvent.ICE_CANDIDATE, {
            roomId: currentUser.roomId,
            candidate: event.candidate,
          });
        }
      };

      socket.emit(SocketEvent.VIDEO_CALL_REQUEST, {
        roomId: currentUser.roomId,
        user: currentUser,
      });

      setIsCalling(true);
    } catch (err) {
      console.error("Error starting call:", err);
    }
  };

  const stopCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsCalling(false);
    setRemoteUsers([]);
  };

  const addRemoteUser = (user: User) => {
    setRemoteUsers((prev) =>
      prev.some((u) => u.socketId === user.socketId) ? prev : [...prev, user]
    );
  };

  const removeRemoteUser = (socketId: string) => {
    setRemoteUsers((prev) => prev.filter((u) => u.socketId !== socketId));
  };

  return (
    <VideoCallContext.Provider
      value={{
        isCalling,
        startCall,
        stopCall,
        localStream,
        remoteUsers,
        addRemoteUser,
        removeRemoteUser,
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
};

export const useVideoCall = () => {
  const ctx = useContext(VideoCallContext);
  if (!ctx) throw new Error("useVideoCall must be inside VideoCallProvider");
  return ctx;
};
