package com.my.back.entity;

import lombok.*;

import java.io.Serializable;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class GymReviewId implements Serializable {
    private Long gId;
    private Long uId;
}