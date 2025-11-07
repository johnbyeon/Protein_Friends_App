import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { del } from '../../../lib/api'
import { useBranchStore } from '../../../stores/branchStore'

const BranchManagement = () => {
    const { branches, loading, error, fetchBranches } = useBranchStore()

    useEffect(() => {
        fetchBranches(true) // 강제 새로고침으로 최신 데이터 가져오기
    }, [fetchBranches])

    const handleDelete = async (id) => {
        if (!confirm('정말로 이 지점을 삭제하시겠습니까?')) return

        try {
            await del(`/api/admin/branches/${id}`)
            // store의 지점 목록 새로고침 (강제 새로고침)
            await fetchBranches(true)
        } catch (err) {
            console.error('Failed to delete branch:', err)
            alert('지점 삭제에 실패했습니다.')
        }
    }

    // branches를 프론트엔드 형식으로 변환
    const formattedBranches = useMemo(() => {
        if (!Array.isArray(branches)) return []
        const formatted = branches.map(branch => ({
            id: branch.gid,
            name: branch.gname || '',
            address: branch.gaddress || '',
            phone: branch.gtel || '',
            operatingHours: branch.gworkoutDuration ? [branch.gworkoutDuration] : [],
            parkingInfo: branch.gparking || '',
            stations: branch.stations?.map(station => ({
                line: station.stationLine || '',
                label: station.stationName || '',
                distance: station.walkTime ? station.walkTime + '분' : '',
                color: determineLineColor(station.stationLine)
            })) || [],
            image: branch.gimageUrl || null,
            latitude: branch.glatitude || 0,
            longitude: branch.glongitude || 0
        }))
        console.log('🔍 [BranchManagement] 변환된 formattedBranches:', formatted)
        if (formatted.length > 0) {
            console.log('🔍 [BranchManagement] 첫 번째 변환된 지점:', formatted[0])
        }
        return formatted
    }, [branches])

    const sortedBranches = useMemo(
        () => [...formattedBranches].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
        [formattedBranches]
    )

    return (
        <div className="flex min-h-screen flex-col bg-background-dark text-text-light">
            <main className="flex-1 px-6 py-10">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                    <header className="flex items-center justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-widest text-primary/80">Admin</p>
                            <h1 className="text-3xl font-bold text-text-light">피트니스 센터 지점 관리</h1>
                            <p className="mt-2 text-sm text-gray-400">
                                현재 등록된 지점 정보를 검토하고 신규 지점을 추가하세요.
                            </p>
                        </div>
                        <Link
                            to="/admin/centers/branches/new"
                            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                        >
                            <span className="material-symbols-outlined text-base">add_location_alt</span>
                            새 지점 추가
                        </Link>
                    </header>

                    <section className="grid gap-6 lg:grid-cols-2">
                        {loading ? (
                            <div className="col-span-full rounded-xl border border-primary/40 bg-background-dark/60 p-10 text-center text-gray-400">
                                지점 목록을 불러오는 중...
                            </div>
                        ) : error ? (
                            <div className="col-span-full rounded-xl border border-red-500/40 bg-red-500/10 p-10 text-center text-red-400">
                                {error}
                                <button
                                    onClick={fetchBranches}
                                    className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
                                >
                                    다시 시도
                                </button>
                            </div>
                        ) : (
                            <>
                                {sortedBranches.map((branch) => (
                                    <BranchCard
                                        key={branch.id}
                                        branch={branch}
                                        onDelete={() => handleDelete(branch.id)}
                                    />
                                ))}
                                {sortedBranches.length === 0 && (
                                    <div className="col-span-full rounded-xl border border-dashed border-primary/40 bg-background-dark/60 p-10 text-center text-gray-400">
                                        등록된 지점이 없습니다. &ldquo;새 지점 추가&rdquo; 버튼을 눌러 첫 지점을 등록해 주세요.
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>
            </main>
        </div>
    )
}

const BranchCard = ({ branch, onDelete }) => {
    return (
        <div
            className="bg-surface rounded-lg border border-primary/50 flex overflow-hidden hover:border-primary transition-colors"
        >
            {/* 지점 이미지 */}
            <img
                alt={`${branch.name} 외관`}
                className="w-1/3 object-cover"
                src={branch.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23111827"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%233DFA2F"%3ENo Image%3C/text%3E%3C/svg%3E'}
                onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23111827"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%233DFA2F"%3ENo Image%3C/text%3E%3C/svg%3E'
                }}
            />

            {/* 지점 정보 */}
            <div className="w-2/3 p-6 flex flex-col justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{branch.name}</h2>
                    <p className="text-white/70 mb-1 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">location_on</span>
                        {branch.address}
                    </p>
                    <p className="text-white/70 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">call</span>
                        {branch.phone}
                    </p>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-white/80">
                        {/* 이용 시간 */}
                        <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-lg mt-0.5">schedule</span>
                            <div>
                                <h3 className="font-semibold text-white/90">이용 시간</h3>
                                <p className="whitespace-pre-line">{branch.operatingHours.join('\n')}</p>
                            </div>
                        </div>

                        {/* 주차 안내 */}
                        <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-lg mt-0.5">local_parking</span>
                            <div>
                                <h3 className="font-semibold text-white/90">주차 안내</h3>
                                <p>{branch.parkingInfo}</p>
                            </div>
                        </div>

                        {/* 주변 역 정보 */}
                        {branch.stations && branch.stations.length > 0 && (
                            <div className="flex items-start gap-2 col-span-2">
                                <span className="material-symbols-outlined text-lg mt-0.5">train</span>
                                <div>
                                    <h3 className="font-semibold text-white/90">주변 역 정보</h3>
                                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                                        {branch.stations.map((station) => (
                                            <div key={`${station.line}-${station.label}`} className="flex items-center gap-2">
                                                <span
                                                    className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full ${station.color}`}
                                                >
                                                    {station.line}
                                                </span>
                                                <span className="font-medium">{station.label}</span>
                                                <span className="text-white/60">{station.distance}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link
                        to={`/admin/centers/branches/${branch.id}/edit`}
                        className="flex items-center gap-1 rounded-full border border-border-dark px-3 py-2 text-sm text-gray-300 hover:text-text-light"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="material-symbols-outlined text-base">edit</span>
                        수정
                    </Link>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="flex items-center gap-1 rounded-full border border-primary/40 px-3 py-2 text-sm text-primary hover:bg-primary/10"
                    >
                        <span className="material-symbols-outlined text-base">delete</span>
                        삭제
                    </button>
                </div>
            </div>
        </div>
    )
}

const CardInfoBlock = ({ icon, title, content }) => (
    <div className="flex gap-3 rounded-lg border border-border-dark/60 bg-background-dark/60 p-3 text-sm">
        <span className="material-symbols-outlined text-lg text-primary">{icon}</span>
        <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">{title}</p>
            <div className="mt-1 space-y-1 text-gray-200">{content}</div>
        </div>
    </div>
)

const determineLineColor = (lineNumber) => {
    switch (lineNumber) {
    case '1':
        return 'bg-blue-500'
    case '2':
        return 'bg-green-500'
    case '3':
        return 'bg-orange-500'
    case '4':
        return 'bg-sky-500'
    case '5':
        return 'bg-purple-500'
    case '6':
        return 'bg-yellow-500'
    case '7':
        return 'bg-emerald-500'
    case '8':
        return 'bg-pink-500'
    case '9':
        return 'bg-gray-500'
    default:
        return 'bg-primary'
    }
}

export default BranchManagement