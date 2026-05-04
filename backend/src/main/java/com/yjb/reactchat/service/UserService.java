package com.yjb.reactchat.service;

import com.yjb.reactchat.dto.UserDto;
import com.yjb.reactchat.handler.ChatWebSocketHandler;
import com.yjb.reactchat.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private ChatWebSocketHandler chatWebSocketHandler;

    public String create(Map<String, Object> param) throws IOException {
        int result = userMapper.insert(param);
        if (result == 0) {
            throw new RuntimeException("Failed to create user");
        }

        List<UserDto> userList = selectAll();
        chatWebSocketHandler.sendUserList(userList);

        return null;
    }

    public List<UserDto> selectAll() {
        return userMapper.selectAll();
    }

    public String delete(Map<String, Object> param) throws IOException {
        int result = userMapper.delete(param);
        if (result == 0) {
            throw new RuntimeException("Failed to delete user");
        }

        List<UserDto> userList = selectAll();
        chatWebSocketHandler.sendUserList(userList);

        return null;
    }
}
