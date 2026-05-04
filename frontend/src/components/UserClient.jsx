import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./UserClient.css";
import ChatMessageBox from "./ChatMessageBox";

const minSize = {
  width: 420,
  height: 620,
};

const resizeHandles = ["n", "e", "s", "w", "ne", "se", "sw", "nw"];
let highestZIndex = 1;

function UserClient({
  user,
  rooms,
  websocketRef,
  receivedChatMessage,
  onClose,
}) {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState(minSize);
  const [zIndex, setZIndex] = useState(highestZIndex);
  const [clientRooms, setClientRooms] = useState(() => rooms ?? []);
  const chatMessagesRef = useRef(null);
  const actionRef = useRef(null);
  const receivedChatMessageRef = useRef(null);

  const roomSignature = useMemo(
    () => (Array.isArray(rooms) ? rooms.map((room) => room.id).join("|") : ""),
    [rooms],
  );

  const selectedRoom = useMemo(
    () => clientRooms.find((room) => room.id === selectedRoomId) ?? null,
    [clientRooms, selectedRoomId],
  );

  const bringToFront = () => {
    highestZIndex += 1;
    setZIndex(highestZIndex);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || !selectedRoom) {
      return;
    }

    const socket = websocketRef?.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    // 메시지를 보내면 웹소켓으로 전달
    socket.send(
      JSON.stringify({
        type: "CHAT_MESSAGE",
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        userId: user.id,
        userName: user.name,
        message: trimmedMessage,
      }),
    );

    setMessage("");
  };

  const startPointerAction = (event, type) => {
    if (event.button !== 0) {
      return;
    }

    bringToFront();
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    actionRef.current = {
      type,
      pointerId: event.pointerId,
      captureTarget: event.currentTarget,
      startX: event.clientX,
      startY: event.clientY,
      startPosition: position,
      startSize: size,
    };
  };

  const handlePointerMove = (event) => {
    const action = actionRef.current;

    if (!action || action.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - action.startX;
    const deltaY = event.clientY - action.startY;

    if (action.type === "move") {
      setPosition({
        x: action.startPosition.x + deltaX,
        y: action.startPosition.y + deltaY,
      });
      return;
    }

    const nextPosition = { ...action.startPosition };
    const nextSize = { ...action.startSize };

    if (action.type.includes("e")) {
      nextSize.width = Math.max(minSize.width, action.startSize.width + deltaX);
    }

    if (action.type.includes("s")) {
      nextSize.height = Math.max(
        minSize.height,
        action.startSize.height + deltaY,
      );
    }

    if (action.type.includes("w")) {
      const nextWidth = Math.max(
        minSize.width,
        action.startSize.width - deltaX,
      );
      nextPosition.x =
        action.startPosition.x + action.startSize.width - nextWidth;
      nextSize.width = nextWidth;
    }

    if (action.type.includes("n")) {
      const nextHeight = Math.max(
        minSize.height,
        action.startSize.height - deltaY,
      );
      nextPosition.y =
        action.startPosition.y + action.startSize.height - nextHeight;
      nextSize.height = nextHeight;
    }

    setPosition(nextPosition);
    setSize(nextSize);
  };

  const handlePointerUp = (event) => {
    const action = actionRef.current;

    if (!action || action.pointerId !== event.pointerId) {
      return;
    }

    actionRef.current = null;
    if (action.captureTarget.hasPointerCapture(event.pointerId)) {
      action.captureTarget.releasePointerCapture(event.pointerId);
    }
  };

  const selectAllChatRooms = useCallback(() => {
    fetch(`/api/room/selectAll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setChatMessages([]);
        setClientRooms(data.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [user.id]);

  const joinRoom = (room) => {
    const socket = websocketRef?.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    socket.send(
      JSON.stringify({
        type: "JOIN_ROOM",
        roomId: room.id,
      }),
    );

    fetch(`/api/chatMessage/selectAll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId: room.id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("🚀 ~ joinRoom ~ data:", data.data);
        setChatMessages(data.data);
        scrollChatToBottom();
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    if (room.joined) {
      return;
    }

    fetch(`/api/room/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        roomId: room.id,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setClientRooms((prevRooms) =>
          prevRooms.map((r) => (r.id === room.id ? { ...r, joined: true } : r)),
        );
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useEffect(() => {
    selectAllChatRooms();
  }, [selectAllChatRooms, roomSignature]);

  useEffect(() => {
    if (
      !receivedChatMessage ||
      receivedChatMessageRef.current === receivedChatMessage
    ) {
      return;
    }

    receivedChatMessageRef.current = receivedChatMessage;

    if (receivedChatMessage.roomId !== selectedRoom?.id) {
      return;
    }

    queueMicrotask(() => {
      setChatMessages((prevChatMessages) => {
        const exists = prevChatMessages.some(
          (chatMessage) =>
            chatMessage.sender === receivedChatMessage.sender &&
            chatMessage.message === receivedChatMessage.message,
        );

        if (exists) {
          return prevChatMessages;
        }

        return [...prevChatMessages, receivedChatMessage];
      });
    });
  }, [receivedChatMessage, selectedRoom?.id]);

  const scrollChatToBottom = () => {
    const chatMessagesElement = chatMessagesRef.current;

    if (!chatMessagesElement) {
      return;
    }

    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
  };

  useEffect(() => {
    scrollChatToBottom();
  }, [chatMessages, selectedRoom?.id]);

  return (
    <div
      className="user-client"
      onPointerDown={bringToFront}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex,
      }}
    >
      <header
        className="user-client-header"
        onPointerDown={(event) => startPointerAction(event, "move")}
      >
        <div>
          <h2>{user.name}</h2>
          <span>{selectedRoom ? selectedRoom.name : "Select a room"}</span>
        </div>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onClose}
          aria-label="Close user client"
        >
          X
        </button>
      </header>

      <div className="user-client-body">
        <aside className="client-room-list" aria-label="Chat rooms">
          {Array.isArray(clientRooms) && clientRooms.length > 0 ? (
            clientRooms.map((room) => (
              <button
                key={room.id}
                type="button"
                className={
                  selectedRoomId === room.id
                    ? "client-room-item active"
                    : "client-room-item"
                }
                onClick={() => {
                  setSelectedRoomId(room.id);
                  joinRoom(room);
                }}
              >
                <span className="room-name">{room.name}</span>
                <span className="join-status">
                  {room.joined ? " (참여중)" : ""}
                </span>
              </button>
            ))
          ) : (
            <p className="client-empty">No rooms</p>
          )}
        </aside>

        <section className="client-chat-panel" aria-label="Chat room">
          {selectedRoom ? (
            <>
              <div className="client-chat-header">
                <strong>{selectedRoom.name}</strong>
                {/* <span>{selectedRoom.isPublic ? "Public" : "Private"}</span> */}
              </div>
              <div className="client-chat-messages" ref={chatMessagesRef}>
                {chatMessages.map((chatMessage, index) => (
                  <ChatMessageBox
                    key={chatMessage.id ?? `${chatMessage.userName}-${index}`}
                    userName={user.name}
                    sender={chatMessage.sender}
                    message={chatMessage.message}
                  />
                ))}
              </div>
              <form className="client-chat-form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Type a message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
                <button type="submit">Send</button>
              </form>
            </>
          ) : (
            <div className="client-chat-placeholder">Choose a room to chat</div>
          )}
        </section>
      </div>

      {resizeHandles.map((handle) => (
        <span
          className={`user-client-resize-handle resize-${handle}`}
          aria-hidden="true"
          key={handle}
          onPointerDown={(event) => startPointerAction(event, handle)}
        />
      ))}
    </div>
  );
}

export default UserClient;
