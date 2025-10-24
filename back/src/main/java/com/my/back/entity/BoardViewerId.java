package com.my.back.entity;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * board_viewer 복합키
 * - p_id + u_id + date
 */
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class BoardViewerId implements Serializable {

    private Long pId;
    private Long uId;
    private LocalDateTime date;
}