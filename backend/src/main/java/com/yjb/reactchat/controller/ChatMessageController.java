package com.yjb.reactchat.controller;

import com.yjb.reactchat.common.Constants;
import com.yjb.reactchat.dto.ChatMessageDto;
import com.yjb.reactchat.service.ChatMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chatMessage")
public class ChatMessageController {

    @Autowired
    private ChatMessageService chatMessageService;

    @PostMapping("/selectAll")
    public Map<String, Object> selectAll(@RequestBody Map<String, Object> param) {
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put(Constants.RESULT, Constants.SUCCESS);

        try {
            List<ChatMessageDto> chatMessageList = chatMessageService.selectAll(param);

            responseMap.put(Constants.DATA, chatMessageList);
        } catch (Exception err) {
            responseMap.put(Constants.RESULT, Constants.FAIL);
            responseMap.put(Constants.ERROR_MESSAGE, err.getMessage());
        }

        return responseMap;
    }

}
