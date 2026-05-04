package com.yjb.reactchat.service;

import com.yjb.reactchat.dto.ChatRoomDto;
import com.yjb.reactchat.handler.ChatWebSocketHandler;
import com.yjb.reactchat.mapper.RoomMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class RoomService {

    private final Logger logger = LoggerFactory.getLogger(this.getClass().getSimpleName());

    @Autowired
    private RoomMapper roomMapper;

    @Autowired
    private ChatWebSocketHandler chatWebSocketHandler;

    public String create(Map<String, Object> param) {
        int result = roomMapper.insert(param);
        if (result == 0) {
            throw new RuntimeException("Failed to create room");
        }

        try {
            List<ChatRoomDto> chatRooms = roomMapper.selectAll(param);
            chatWebSocketHandler.sendChatRoomList(chatRooms);
        } catch (Exception e) {
            logger.error(e.getMessage());
        }

        return null;
    }

    public List<ChatRoomDto> selectAll(Map<String, Object> param) {
        return roomMapper.selectAll(param);
    }

    public String delete(Map<String, Object> param) {
        int result = roomMapper.delete(param);
        if (result == 0) {
            throw new RuntimeException("Failed to delete room");
        }

        try {
            List<ChatRoomDto> chatRooms = roomMapper.selectAll(param);
            chatWebSocketHandler.sendChatRoomList(chatRooms);
        } catch (Exception e) {
            logger.error(e.getMessage());
        }

        return null;
    }

    public String join(Map<String, Object> param) {
        int result = roomMapper.insertParticipant(param);
        if (result == 0) {
            throw new RuntimeException("Failed to join room");
        }

        try {
            List<ChatRoomDto> chatRooms = roomMapper.selectAll(param);
            chatWebSocketHandler.sendChatRoomList(chatRooms);
        } catch (Exception e) {
            logger.error(e.getMessage());
        }

        return null;
    }
}
