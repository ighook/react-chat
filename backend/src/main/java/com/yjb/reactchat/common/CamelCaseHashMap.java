package com.moricon.workmgmt.common;

import org.springframework.lang.Nullable;

import java.util.HashMap;

@SuppressWarnings("serial")
public class CamelCaseHashMap extends HashMap<String, Object> {
    @Override
    public Object put(String key, Object value) {
        return super.put(convertUnderscoreNameToPropertyName(key), value);
    }

    private String convertUnderscoreNameToPropertyName(@Nullable String name) {
        StringBuilder result = new StringBuilder();
        boolean nextIsUpper = false;
        if (name != null && name.length() > 0) {
            if (name.length() > 1 && name.charAt(1) == '_') {
                result.append(Character.toUpperCase(name.charAt(0)));
            } else {
                result.append(Character.toLowerCase(name.charAt(0)));
            }
            for (int i = 1; i < name.length(); i++) {
                char c = name.charAt(i);
                if (c == '_') {
                    nextIsUpper = true;
                } else {
                    if (nextIsUpper) {
                        result.append(Character.toUpperCase(c));
                        nextIsUpper = false;
                    } else {
                        result.append(c);
                    }
                }
            }
        }
        return result.toString();
    }
}