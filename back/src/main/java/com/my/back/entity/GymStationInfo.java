package com.my.back.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 지점 주변 역정보 테이블 (11_2. gym_station_info)
 * - 컬럼명/제약/타입 100% 문서 준수
 * - 복합키: g_id + g_station_name
 */
@Entity
@Table(name = "gym_station_info")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GymStationInfo {

    /**
     * 지점 번호 (복합키 일부, not null)
     * - gym_info.g_id 참조
     */
    @Id
    @Column(name = "g_id", nullable = false)
    private Long gId;

    /**
     * 역이름 (복합키 일부, not null)
     * - 예: "강남역"
     */
    @Id
    @Column(name = "g_station_name", nullable = false, length = 100)
    private String gStationName;

    /**
     * 노선번호 (not null)
     * - 예: "2호선"
     */
    @Column(name = "g_line_number", nullable = false, length = 50)
    private String gLineNumber;

    /**
     * 도보거리 (not null)
     * - 예: "도보 5분"
     */
    @Column(name = "g_walking_distance", nullable = false, length = 100)
    private String gWalkingDistance;

    // === 관계 매핑 (LAZY) ===
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "g_id", insertable = false, updatable = false)
    private GymInfo gymInfo;
}