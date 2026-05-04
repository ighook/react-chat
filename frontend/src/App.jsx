import { useState, useEffect, useRef } from "react";
import "./App.css";
import UserClient from "./components/UserClient";

import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from "unique-names-generator";

function App() {
  const websocketRef = useRef(null);

  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [userClientList, setUserClientList] = useState([]);
  const [receivedChatMessage, setReceivedChatMessage] = useState(null);

  const createRoom = () => {
    const nextRoomNumber = rooms.length + 1;

    const newRoom = {
      id: crypto.randomUUID(),
      name: `Room ${nextRoomNumber}`,
      isPublic: true,
    };

    fetch(`/api/room/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: newRoom.id,
        name: newRoom.name,
        isPublic: newRoom.isPublic,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const deleteChatRoom = (roomId) => {
    fetch(`/api/room/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: roomId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const createUser = () => {
    const randomName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: " ",
      style: "capital",
    });

    fetch("/api/user/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        name: randomName,
      }),
    })
      .then((response) => response.json())
      .then(() => {})
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const selectAllChatRooms = () => {
    fetch(`/api/room/selectAll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((data) => {
        setRooms(data.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const selectAllUsers = () => {
    fetch(`/api/user/selectAll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const deleteUser = (userId) => {
    fetch(`/api/user/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: userId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const openUserClient = (user) => {
    console.log("🚀 ~ openUserClient ~ user:", user);
    const exists = userClientList.some((client) => client.id === user.id);

    if (!exists) {
      setUserClientList([...userClientList, user]);
    }
  };

  const closeUserClient = (userId) => {
    setUserClientList(userClientList.filter((user) => user.id !== userId));
  };

  useEffect(() => {
    // 웹 소켓
    const isLocal = window.location.hostname === "localhost";
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socketUrl = isLocal
      ? "ws://localhost:8080/ws/chat"
      : `${protocol}://${window.location.host}/ws/chat`;

    const socket = new WebSocket(socketUrl);

    websocketRef.current = socket;

    socket.onmessage = (event) => {
      console.log("🚀 ~ App ~ event:", event);
      try {
        const message = JSON.parse(event.data);

        if (message.type == "CHAT_ROOM_LIST") {
          setRooms(message.data);
          console.log("1");
        } else if (message.type == "USER_LIST") {
          setUsers(message.data);
        } else if (
          message.type == "RECEIVE_CHAT" ||
          message.type == "CHAT_MESSAGE"
        ) {
          setReceivedChatMessage(
            message.data ? JSON.parse(message.data) : message,
          );
        }
      } catch {
        console.log("WebSocket message:", event.data);
      }
    };

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    // 채팅방 목록 조회
    selectAllChatRooms();

    // 사용자 목록 조회
    selectAllUsers();

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="app-shell">
      <aside className="side-menu" aria-label="Main navigation">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            R
          </span>
          <div>
            <strong>React Chat</strong>
            <span>Simulator</span>
          </div>
        </div>

        <div className="menu-nav">
          <div className="menu-nav-item">
            <label>채팅방 목록</label>
            <button type="button" onClick={createRoom}>
              채팅방 생성
            </button>

            <div className="room-list">
              {Array.isArray(rooms) && rooms.length > 0 ? (
                rooms.map((room) => (
                  <div key={room.id} className="room-item">
                    {room.name}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteChatRoom(room.id);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                ))
              ) : (
                <div
                  className="room-item"
                  style={{ color: "#94a3b8", textAlign: "center" }}
                >
                  생성된 채팅방이 없습니다.
                </div>
              )}
            </div>
          </div>

          <div className="menu-nav-item">
            <label>유저 목록</label>
            <button type="button" onClick={createUser}>
              유저 추가
            </button>

            <div className="user-list">
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="user-item"
                    onClick={() => openUserClient(user)}
                  >
                    {user.name}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteUser(user.id);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                ))
              ) : (
                <div
                  className="user-item"
                  style={{ color: "#94a3b8", textAlign: "center" }}
                >
                  생성된 유저가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {
        <main className="main-page" aria-label="Chat workspace">
          {userClientList.map((user) => (
            <UserClient
              key={user.id}
              user={user}
              rooms={rooms}
              websocketRef={websocketRef}
              receivedChatMessage={receivedChatMessage}
              onClose={() => closeUserClient(user.id)}
            />
          ))}
        </main>
      }
    </div>
  );
}

export default App;
