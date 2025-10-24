import React from "react";
import { Link } from "react-router-dom";
import pfLogo from '../assets/pflogo.svg'
import { useAuthStore } from '../stores/authStore'

const Navbar = () => {
    const { user } = useAuthStore();
    const userRole = user?.role;
    
    // 역할별 메뉴 권한 정의
    const hasAdminAccess = userRole?.includes('ADMIN');
    const hasTrainerAccess = userRole?.includes('TRAINER') || hasAdminAccess;
    const hasUserAccess = userRole?.includes('USER') || hasTrainerAccess;
    
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-light dark:border-border-dark px-6 py-3 bg-background-light dark:bg-background-dark sticky top-0 z-20">
            {/* 로고 + 타이틀 */}
            <div className="flex items-center gap-10">
                <Link to="/" className="flex items-center gap-1 text-text-light dark:text-text-dark">
                    {/* ✅ SVG 로고로 교체 */}
                    <img
                        src={pfLogo}
                        alt="Protein Friends Logo"
                        className="w-8 h-8 mt-1 object-contain text-primary"
                    />
                    <h1 className="text-xl font-bold leading-tight tracking-[-0.015em]">
                        프로틴 프랜즈
                    </h1>
                </Link>
            </div>
       
            {/* 네비게이션 메뉴 */}
            <nav className="hidden md:flex items-center gap-6">
                {/* 모든 유저: 로그인 */}
                <Link
                    to="/login"
                    className="text-sm font-medium text-text-light dark:text-text-dark"
                >
                    로그인
                </Link>

                {/* 모든 유저: 회원가입 */}
                <Link
                    to="/auth/register"
                    className="text-sm font-medium text-text-light dark:text-text-dark"
                >
                    회원가입
                </Link>

                {/* 일반 유저: 회원정보 */}
                {hasUserAccess && !hasTrainerAccess && (
                    <Link
                        to="/profile"
                        className="text-sm font-medium text-text-light dark:text-text-dark"
                    >
                        회원정보
                    </Link>
                )}

                {/* 트레이너, 어드민: 유저리스트 보기 */}
                {hasTrainerAccess && (
                    <Link
                        to="/users"
                        className="text-sm font-medium text-text-light dark:text-text-dark"
                    >
                        유저리스트 보기
                    </Link>
                )}
            </nav>

            {/* 프로필 이미지 */}
            <div className="flex items-center gap-4">
                <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                    style={{
                        backgroundImage:
                            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCWv6PK6uHIuU6FSourNK8U7EvzgJD3MRfIdkT3PNtI7eOKlgTtDcXXqyiwr2uh1FT6cQV-fq5cCPb_j3o-dkitZtWfO924D-Mv60jMXWXhCqErfwTLvZuxWQgIaXznlVr2ztUO1jagD4bfV6Eb97pLSApDbW_e9p6MzMcs1F3IXP5CahY7pVsl2Og_nR73mtfurLGrmEXDautZQ7pXcCUSlEToqsjlYs7dpBgODCwuarhM4uXI8PMaf3fGkuvp3NZQaim9ODXJrFk")',
                    }}
                ></div>
            </div>
        </header>
    );
};

export default Navbar;
