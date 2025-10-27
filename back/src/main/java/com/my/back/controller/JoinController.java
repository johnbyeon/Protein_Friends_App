package com.my.back.controller;

import com.my.back.dto.JoinDTO;
import com.my.back.service.JoinService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class JoinController {

    private final JoinService joinService;


    @PostMapping("/join")
    public String joinProcess(@RequestBody JoinDTO joinDTO) {

        System.out.println(joinDTO.getEmail());
        joinService.joinProcess(joinDTO);

        return "ok";
    }
}