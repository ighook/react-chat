package com.yjb.reactchat.controller;

import com.yjb.reactchat.common.Constants;
import com.yjb.reactchat.dto.UserDto;
import com.yjb.reactchat.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public Map<String, Object> create(@RequestBody Map<String, Object> param) {
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put(Constants.RESULT, Constants.SUCCESS);

        try {
            String result = userService.create(param);

            if (result != null) {
                throw new RuntimeException("Failed to create user");
            }

            responseMap.put(Constants.DATA, null);
        } catch (Exception err) {
            responseMap.put(Constants.RESULT, Constants.FAIL);
            responseMap.put(Constants.ERROR_MESSAGE, err.getMessage());
        }

        return responseMap;
    }

    @PostMapping("/selectAll")
    public Map<String, Object> selectAll() {
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put(Constants.RESULT, Constants.SUCCESS);

        try {
            List<UserDto> users = userService.selectAll();

            responseMap.put(Constants.DATA, users);
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
            userService.delete(param);

            responseMap.put(Constants.DATA, null);
        } catch (Exception err) {
            responseMap.put(Constants.RESULT, Constants.FAIL);
            responseMap.put(Constants.ERROR_MESSAGE, err.getMessage());
        }

        return responseMap;
    }
}
