package com.yjb.reactchat.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRoomDto {
    private String id;
    private String name;
    private boolean isPublic;
    private boolean isJoined;

    public ChatRoomDto(String id, String name, boolean isPublic, boolean isJoined) {
        this.id = id;
        this.name = name;
        this.isPublic = isPublic;
        this.isJoined = isJoined;
    }
}
