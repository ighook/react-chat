package com.yjb.reactchat.handler;

import com.yjb.reactchat.dto.ChatRoomDto;
import com.yjb.reactchat.dto.UserDto;
import com.yjb.reactchat.service.ChatMessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final Logger logger = LoggerFactory.getLogger(this.getClass().getSimpleName());
    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();
    private final Map<String, Set<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ChatMessageService chatMessageService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        System.out.println("연결됨: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        System.out.println("받은 메시지: " + message.getPayload());

        String payload = message.getPayload();

        Map<String, Object> data = objectMapper.readValue(payload, Map.class);
        String type = (String) data.get("type");

        if(type.equals("CHAT_MESSAGE")) {
            handleChatMessage(data);
        }

        if(type.equals("JOIN_ROOM")) {
            handleJoin(session, data);
        }

        /* for (WebSocketSession s : sessions) {
            if (s.isOpen()) {
                s.sendMessage(new TextMessage("RECV from" + session.getId() + ": " + message.getPayload()));
            }
        } */
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        System.out.println("연결 종료: " + session.getId());
    }

    public void sendChatRoomList(List<ChatRoomDto> chatRooms) throws IOException {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "ROOM_LIST");
        message.put("data", chatRooms);

        String json = objectMapper.writeValueAsString(message);

        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(json));
            }
        }
    }

    public void sendUserList(List<UserDto> chatUsers) throws IOException {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "USER_LIST");
        message.put("data", chatUsers);

        String json = objectMapper.writeValueAsString(message);

        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(json));
            }
        }
    }

    public void handleChatMessage(Map<String, Object> data) throws IOException {
        chatMessageService.create(data);

        String roomId = (String) data.get("roomId");
        String userName = (String) data.get("userName");
        String message = (String) data.get("message");

        Map<String, Object> response = new HashMap<>();
        response.put("type", "CHAT_MESSAGE");
        response.put("roomId", roomId);
        response.put("sender", userName);
        response.put("message", message);

        String json = objectMapper.writeValueAsString(response);

        broadcastToRoom(roomId, json);
    }

    public void handleJoin(WebSocketSession session, Map<String, Object> data) throws IOException {
        String roomId = String.valueOf(data.get("roomId"));

        roomSessions
                .computeIfAbsent(roomId, key -> ConcurrentHashMap.newKeySet())
                .add(session);

        System.out.println("Join room: " + roomId + " / session: " + session.getId());
    }

    private void broadcastToRoom(String roomId, String message) throws IOException {
        Set<WebSocketSession> sessions = roomSessions.get(roomId);

        if (sessions == null) return;

        for (WebSocketSession s : sessions) {
            if (s.isOpen()) {
                Map<String, Object> data = new HashMap<>();
                data.put("type", "RECEIVE_CHAT");
                data.put("data", message);

                String json = objectMapper.writeValueAsString(data);

                s.sendMessage(new TextMessage(json));
            }
        }
    }
}
