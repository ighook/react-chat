package com.yjb.reactchat.mapper;

import com.yjb.reactchat.dto.ChatMessageDto;

import java.util.List;
import java.util.Map;

public interface ChatMessageMapper {
    int insert(Map<String, Object> param);

    List<ChatMessageDto> selectAll(Map<String, Object> param);
}
