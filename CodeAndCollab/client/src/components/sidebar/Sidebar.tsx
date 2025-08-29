import SidebarButton from "@/components/sidebar/sidebar-views/SidebarButton";
import { useAppContext } from "@/context/AppContext";
import { useSocket } from "@/context/SocketContext";
import { useViews } from "@/context/ViewContext";
import useResponsive from "@/hooks/useResponsive";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { ACTIVITY_STATE } from "@/types/app";
import { SocketEvent } from "@/types/socket";
import { VIEWS } from "@/types/view";
import { IoCodeSlash } from "react-icons/io5";
import { MdOutlineDraw } from "react-icons/md";
import cn from "classnames";
import { Tooltip } from "react-tooltip";
import { useState, useRef, useEffect } from "react";
import { tooltipStyles } from "./tooltipStyles";
import VideoCallView from "./sidebar-views/VideoCallView";
import { FaVideo } from "react-icons/fa";
import { useVideoCall } from "@/context/VideoCallContext";

function Sidebar() {
  const { activeView, isSidebarOpen, viewComponents, viewIcons, setIsSidebarOpen } = useViews();
  const { minHeightReached } = useResponsive();
  const { activityState, setActivityState } = useAppContext();
  const { socket } = useSocket();
  const { isMobile } = useWindowDimensions();

  const { isCalling, stopCall } = useVideoCall();
  

  const [showTooltip, setShowTooltip] = useState(true);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  const changeState = () => {
    setShowTooltip(false);
    if (activityState === ACTIVITY_STATE.CODING) {
      setActivityState(ACTIVITY_STATE.DRAWING);
      socket.emit(SocketEvent.REQUEST_DRAWING);
    } else {
      setActivityState(ACTIVITY_STATE.CODING);
    }
    if (isMobile) setIsSidebarOpen(false);
  };

  const toggleVideoCall = () => {
    setIsVideoCallOpen((prev) => !prev);
  };

  return (
    <aside className="flex w-full md:h-full md:max-h-full md:min-h-full md:w-auto">
      <div
        className={cn(
          "fixed bottom-0 left-0 z-50 flex h-[50px] w-full gap-4 border-t border-darkHover bg-dark p-2 md:static md:h-full md:w-[50px] md:min-w-[50px] md:flex-col md:border-r md:border-t-0 md:p-2 md:pt-4",
          { hidden: minHeightReached }
        )}
      >
        <SidebarButton viewName={VIEWS.FILES} icon={viewIcons[VIEWS.FILES]} />
        <SidebarButton viewName={VIEWS.CHATS} icon={viewIcons[VIEWS.CHATS]} />
        <SidebarButton viewName={VIEWS.COPILOT} icon={viewIcons[VIEWS.COPILOT]} />
        <SidebarButton viewName={VIEWS.RUN} icon={viewIcons[VIEWS.RUN]} />
        <SidebarButton viewName={VIEWS.CLIENTS} icon={viewIcons[VIEWS.CLIENTS]} />
        <SidebarButton viewName={VIEWS.SETTINGS} icon={viewIcons[VIEWS.SETTINGS]} />

        {/* Coding <-> Drawing toggle */}
        <div className="flex h-fit items-center justify-center">
          <button
            className="flex items-center rounded p-1.5 hover:bg-[#3D404A]"
            onClick={changeState}
            onMouseEnter={() => setShowTooltip(true)}
            data-tooltip-id="activity-state-tooltip"
            data-tooltip-content={
              activityState === ACTIVITY_STATE.CODING ? "Switch to Drawing Mode" : "Switch to Coding Mode"
            }
          >
            {activityState === ACTIVITY_STATE.CODING ? <MdOutlineDraw size={30} /> : <IoCodeSlash size={30} />}
          </button>
          {showTooltip && (
            <Tooltip
              id="activity-state-tooltip"
              place="right"
              offset={15}
              className="!z-50"
              style={tooltipStyles}
            />
          )}
        </div>

        {/* Video toggle */}
        <div className="flex h-fit items-center justify-center">
          <button
            className="flex items-center rounded p-1.5 hover:bg-[#3D404A]"
            onClick={toggleVideoCall}
          >
            <FaVideo size={30} />
          </button>
        </div>
      </div>

      {/* Sidebar body */}
      <div
        className="absolute left-0 top-0 z-20 w-full flex-col bg-dark md:static md:min-w-[300px]"
        style={isSidebarOpen ? {} : { display: "none" }}
      >
        {!isVideoCallOpen && viewComponents[activeView]}
        {isVideoCallOpen && <VideoCallView />}
      </div>

      {/* Floating mini window */}
      {isCalling && !isVideoCallOpen && (
        <div className="fixed bottom-4 right-4 bg-gray-900 rounded-lg shadow-lg p-2 flex flex-col items-center gap-2 z-50">
          <span className="text-xs text-gray-400">Ongoing Call</span>
          <button
            onClick={stopCall}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            End Call
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
