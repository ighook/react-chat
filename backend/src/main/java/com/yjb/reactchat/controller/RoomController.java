package com.yjb.reactchat.controller;

import com.yjb.reactchat.common.Constants;
import com.yjb.reactchat.dto.ChatRoomDto;
import com.yjb.reactchat.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/room")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @PostMapping("/create")
    public Map<String, Object> create(@RequestBody Map<String, Object> param) {
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put(Constants.RESULT, Constants.SUCCESS);

        try {
            String result = roomService.create(param);

            if (result != null) {
                throw new RuntimeException("Failed to create room");
            }

            responseMap.put(Constants.DATA, null);

        } catch (Exception err) {
            responseMap.put(Constants.RESULT, Constants.FAIL);
            responseMap.put(Constants.ERROR_MESSAGE, err.getMessage());
        }

        return responseMap;
    }

    @PostMapping("/selectAll")
    public Map<String, Object> selectAll(@RequestBody Map<String, Object> param) {
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put(Constants.RESULT, Constants.SUCCESS);

        try {
            List<ChatRoomDto> chatRooms = roomService.selectAll(param);

            responseMap.put(Constants.DATA, chatRooms);
        } catch (Exception err) {
            responseMap.put(Constants.RESULT, Constants.FAIL);
            responseMap.put(Constants.ERROR_MESSAGE, err.getMessage());
        }

        return responseMap;
    }

    @PostMapping("/delete")
    public Map<String, Object> delete(@RequestBody Map<String, Object> param) {
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put(Constants.RESULT, Constants.SUCCESS);

        try {
            roomService.delete(param);

            responseMap.put(Constants.DATA, null);
        } catch (Exception err) {
            responseMap.put(Constants.RESULT, Constants.FAIL);
            responseMap.put(Constants.ERROR_MESSAGE, err.getMessage());
        }

        return responseMap;
    }

    @PostMapping("/join")
    public Map<String, Object> join(@RequestBody Map<String, Object> param) {
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put(Constants.RESULT, Constants.SUCCESS);

        try {
            roomService.join(param);

            responseMap.put(Constants.DATA, null);
        } catch (Exception err) {
            responseMap.put(Constants.RESULT, Constants.FAIL);
            responseMap.put(Constants.ERROR_MESSAGE, err.getMessage());
        }

        return responseMap;
    }
}
