package com.my.back.service;

import com.my.back.dto.InbodyDto;
import com.my.back.dto.InbodyGroupDto;
import com.my.back.entity.InbodyUrl;
import com.my.back.repository.InbodyUrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 내 인바디 데이터 조회 서비스
 */
@Service
@RequiredArgsConstructor
public class MyInbodyService {

    private final InbodyUrlRepository inbodyUrlRepository;

    /** 유저 ID 기준 인바디 데이터 조회 (날짜별 그룹화) */
    public List<InbodyGroupDto> getMyInbody(Long userId) {
        List<InbodyUrl> inbodyUrls = inbodyUrlRepository.findByUsers_UIdOrderByCreateDateDesc(userId);

        // 날짜별로 그룹화
        Map<String, List<InbodyUrl>> groupedByDate = inbodyUrls.stream()
                .collect(Collectors.groupingBy(
                        inbody -> formatDate(inbody.getCreateDate())
                ));

        // DTO로 변환
        return groupedByDate.entrySet().stream()
                .sorted((e1, e2) -> e2.getKey().compareTo(e1.getKey())) // 날짜 내림차순 정렬
                .map(entry -> {
                    List<InbodyDto> inbodyDtos = entry.getValue().stream()
                            .map(this::convertToDto)
                            .collect(Collectors.toList());

                    return InbodyGroupDto.builder()
                            .date(entry.getKey())
                            .images(inbodyDtos)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /** InbodyUrl → InbodyDto 변환 */
    private InbodyDto convertToDto(InbodyUrl inbodyUrl) {
        return InbodyDto.builder()
                .inbodyRecordId(inbodyUrl.getInbodyRecordId())
                .inbodyPicUrl(inbodyUrl.getInbodyPicUrl())
                .createDate(inbodyUrl.getCreateDate())
                .formattedDate(formatDate(inbodyUrl.getCreateDate()))
                .build();
    }

    /** 날짜 포맷팅: "2024년 5월 11일" */
    private String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy년 M월 d일");
        return dateTime.format(formatter);
    }
}