package com.yjb.reactchat.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageDto {
    private String sender;
    private String message;
    private String createdAt;
}