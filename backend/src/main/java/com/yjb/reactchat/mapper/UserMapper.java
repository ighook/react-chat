package com.yjb.reactchat.mapper;

import com.yjb.reactchat.dto.UserDto;

import java.util.List;
import java.util.Map;

public interface UserMapper {
    int insert(Map<String, Object> param);

    List<UserDto> selectAll();

    int delete(Map<String, Object> param);
}
