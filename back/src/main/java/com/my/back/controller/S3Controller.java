package com.my.back.controller;

import com.my.back.Service.S3PresignService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/s3")
@ResponseBody
public class S3Controller {

    private final S3PresignService s3Service;

    @GetMapping("/download")
    public String getDownloadUrl(@RequestParam String key) {
        return s3Service.getDownloadUrl("protein-friends-s3", key);
    }

    @PostMapping("/upload")
    public String getUploadUrl(@RequestParam String filename,
                               @RequestParam String contentType) {
        String key = "uploads/test/" + filename;
        return s3Service.getUploadUrl("protein-friends-s3", key, contentType);
    }
}
