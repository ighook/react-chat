package com.yjb.reactchat.service;

import com.yjb.reactchat.dto.ChatMessageDto;
import com.yjb.reactchat.mapper.ChatMessageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ChatMessageService {

    @Autowired
    private ChatMessageMapper chatMessageMapper;

    public String create(Map<String, Object> param) {
        if (param.get("userId") == null) {
            throw new RuntimeException("userId is required");
        }

        if (param.get("roomId") == null) {
            throw new RuntimeException("roomId is required");
        }

        if (param.get("message") == null) {
            throw new RuntimeException("message is required");
        }

        int result = chatMessageMapper.insert(param);
        if (result == 0) {
            throw new RuntimeException("Failed to create chat message");
        }

        return null;
    }

    public List<ChatMessageDto> selectAll(Map<String, Object> param) {
        return chatMessageMapper.selectAll(param);
    }
}
