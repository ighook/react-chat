package com.yjb.reactchat.mapper;

import com.yjb.reactchat.dto.ChatRoomDto;

import java.util.List;
import java.util.Map;

public interface RoomMapper {
    int insert(Map<String, Object> param);

    List<ChatRoomDto> selectAll(Map<String, Object> param);

    int delete(Map<String, Object> param);

    int insertParticipant(Map<String, Object> param);
}