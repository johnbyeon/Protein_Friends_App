package com.my.back.service;

import com.my.back.dto.JoinDTO;
import com.my.back.entity.UserRole;
import com.my.back.entity.Users;
import com.my.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

@Service
@RequiredArgsConstructor
public class JoinService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;


    public void joinProcess( JoinDTO joinDTO) {


        //db에 이미 동일한 username을 가진 회원이 존재하는지?
        boolean isUser = userRepository.existsByEmail(joinDTO.getEmail());
        if (isUser) {
            return;
        }


        Users data = new Users();

        data.setEmail(joinDTO.getEmail());
        data.setName(joinDTO.getUsername());
        data.setPassword(bCryptPasswordEncoder.encode(joinDTO.getPassword()));
        data.setUserRole(UserRole.USER);

        userRepository.save(data);
    }
}
