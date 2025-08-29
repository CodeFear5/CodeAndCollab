import { useEffect, useRef } from "react";
import { useVideoCall } from "@/context/VideoCallContext";

const VideoCallView = () => {
  const { isCalling, startCall, stopCall, localStream, remoteUsers } = useVideoCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 h-full w-full bg-dark text-white">
      <h1 className="text-lg font-semibold">Video Call</h1>

      {/* One flexbox for all videos */}
      <div className="flex flex-wrap justify-center items-center gap-3 w-full border border-gray-700 rounded-lg p-3 bg-gray-800">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="w-40 h-28 rounded-md border border-gray-600 bg-black"
        />
        {remoteUsers.map((user) => (
          <video
            key={user.socketId}
            autoPlay
            className="w-40 h-28 rounded-md border border-gray-600 bg-black"
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isCalling ? (
          <button
            onClick={startCall}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Start Call
          </button>
        ) : (
          <button
            onClick={stopCall}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
          >
            End Call
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCallView;
