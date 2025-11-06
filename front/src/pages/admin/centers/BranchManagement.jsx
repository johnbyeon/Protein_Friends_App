import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { del, post, put } from '../../../lib/api'
import { useBranchStore } from '../../../stores/branchStore'

const emptyBranch = {
    id: null,
    name: '',
    address: '',
    phone: '',
    operatingHours: '',
    parkingInfo: '',
    stations: '',
    amenities: '',
    image: '',
}

const BranchManagement = () => {
    const { branches, loading, error, fetchBranches } = useBranchStore()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBranch, setEditingBranch] = useState(null)
    const [formValues, setFormValues] = useState(emptyBranch)
    const [reviewModalOpen, setReviewModalOpen] = useState(false)
    const [selectedBranchReviews, setSelectedBranchReviews] = useState(null)

    useEffect(() => {
        fetchBranches(true) // 강제 새로고침으로 최신 데이터 가져오기
    }, [fetchBranches])

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingBranch(null)
        setFormValues(emptyBranch)
        // 모달 닫힐 때 body 스크롤 복원
        document.body.style.overflow = 'auto'
    }

    const openCreateModal = () => {
        setEditingBranch(null)
        setFormValues(emptyBranch)
        setIsModalOpen(true)
        // 모달 열릴 때 body 스크롤 막기
        document.body.style.overflow = 'hidden'
    }

    const openEditModal = (branch) => {
        setEditingBranch(branch)
        setFormValues({
            id: branch.id,
            name: branch.name,
            address: branch.address,
            phone: branch.phone,
            operatingHours: branch.operatingHours.join('\n'),
            parkingInfo: branch.parkingInfo,
            stations: branch.stations.map((station) => `${station.line}|${station.label}|${station.distance}`).join('\n'),
            amenities: branch.amenities.join('\n'),
            image: branch.image,
        })
        setIsModalOpen(true)
        // 모달 열릴 때 body 스크롤 막기
        document.body.style.overflow = 'hidden'
    }

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormValues((prev) => ({ ...prev, [name]: value }))
    }

    const buildBranchFromForm = () => {
        const nextId = editingBranch?.id ?? Math.max(0, ...branches.map((branch) => branch.id)) + 1
        return {
            id: nextId,
            name: formValues.name,
            address: formValues.address,
            phone: formValues.phone,
            operatingHours: formValues.operatingHours
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean),
            parkingInfo: formValues.parkingInfo,
            stations: formValues.stations
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => {
                    const [lineNumber, label, distance] = line.split('|').map((token) => token.trim())
                    return {
                        line: lineNumber || '',
                        label: label || '',
                        distance: distance || '',
                        color: determineLineColor(lineNumber),
                    }
                }),
            amenities: formValues.amenities
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean),
            image: formValues.image || editingBranch?.image || '',
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        const branchPayload = buildBranchFromForm()

        try {
            if (editingBranch) {
                // 지점 수정 API 호출
                await put(`/api/admin/branches/${branchPayload.id}`, {
                    gName: branchPayload.name,
                    gAddress: branchPayload.address,
                    gTel: branchPayload.phone,
                    gWorkoutDuration: branchPayload.operatingHours.join('\n'),
                    gParking: branchPayload.parkingInfo,
                    gLatitude: branchPayload.latitude || 0,
                    gLongitude: branchPayload.longitude || 0,
                    gImageUrl: branchPayload.image
                })
            } else {
                // 지점 생성 API 호출
                await post('/api/admin/branches', {
                    gName: branchPayload.name,
                    gAddress: branchPayload.address,
                    gTel: branchPayload.phone,
                    gWorkoutDuration: branchPayload.operatingHours.join('\n'),
                    gParking: branchPayload.parkingInfo,
                    gLatitude: branchPayload.latitude || 0,
                    gLongitude: branchPayload.longitude || 0,
                    gImageUrl: branchPayload.image
                })
            }
            // store의 지점 목록 새로고침 (강제 새로고침)
            await fetchBranches(true)
            closeModal()
        } catch (err) {
            console.error('Failed to save branch:', err)
            alert('지점 저장에 실패했습니다.')
        }
    }

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

    const handleReview = async (branch) => {
        try {
            const response = await get(`/api/branches/${branch.id}/reviews`)
            setSelectedBranchReviews({ branch, reviews: response })
            setReviewModalOpen(true)
        } catch (err) {
            console.error('Failed to fetch reviews:', err)
            alert('리뷰 조회에 실패했습니다.')
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
                        <div className="flex items-center gap-3">
                            <Link
                                to="/admin/centers/branches/new"
                                className="rounded-lg border border-primary/40 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                            >
                                전체 등록 페이지 열기
                            </Link>
                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                            >
                                <span className="material-symbols-outlined text-base">add_location_alt</span>
                                새 지점 추가
                            </button>
                        </div>
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
                                        onEdit={() => openEditModal(branch)}
                                        onDelete={() => handleDelete(branch.id)}
                                        onReview={() => handleReview(branch)}
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

            {isModalOpen && (
                <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-primary/30 bg-background-dark p-8 shadow-2xl">
                        <button
                            type="button"
                            className="absolute right-4 top-4 text-gray-400 hover:text-primary"
                            onClick={closeModal}
                        >
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                        <h2 className="mb-6 text-2xl font-semibold text-text-light">
                            {editingBranch ? '지점 정보 수정' : '새 지점 등록'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <FormInput
                                label="지점 이름"
                                name="name"
                                value={formValues.name}
                                onChange={handleChange}
                                placeholder="예) 강남점"
                                required
                            />
                            <FormInput
                                label="주소"
                                name="address"
                                value={formValues.address}
                                onChange={handleChange}
                                placeholder="예) 서울특별시 강남구 ..."
                                required
                            />
                            <FormInput
                                label="대표 전화번호"
                                name="phone"
                                value={formValues.phone}
                                onChange={handleChange}
                                placeholder="예) 02-1234-5678"
                            />
                            <FormTextarea
                                label="이용 시간"
                                name="operatingHours"
                                value={formValues.operatingHours}
                                onChange={handleChange}
                                placeholder="한 줄에 하나씩 입력하세요."
                            />
                            <FormTextarea
                                label="주차 안내"
                                name="parkingInfo"
                                value={formValues.parkingInfo}
                                onChange={handleChange}
                                placeholder="지점 주차 관련 안내를 입력하세요."
                            />
                            <FormTextarea
                                label="주변 역 정보"
                                name="stations"
                                value={formValues.stations}
                                onChange={handleChange}
                                placeholder="노선|역 이름|도보 거리 형태로 입력 (예: 2|강남역|도보 5분)"
                            />
                            <FormTextarea
                                label="편의 시설"
                                name="amenities"
                                value={formValues.amenities}
                                onChange={handleChange}
                                placeholder="한 줄에 하나씩 입력하세요."
                            />
                            <FormInput
                                label="대표 이미지 URL"
                                name="image"
                                value={formValues.image}
                                onChange={handleChange}
                                placeholder="이미지 주소를 입력하세요."
                            />

                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-lg border border-border-dark px-4 py-2 text-sm text-gray-400 hover:text-text-light"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-black hover:opacity-90"
                                >
                                    {editingBranch ? '수정 완료' : '등록 완료'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                data={selectedBranchReviews}
            />
        </div>
    )
}

const BranchCard = ({ branch, onEdit, onDelete, onReview }) => {
    return (
        <div
            className="bg-surface rounded-lg border border-primary/50 flex overflow-hidden cursor-pointer hover:border-primary transition-colors"
            onClick={onReview}
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

const ReviewModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null

    const { branch, reviews } = data

    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-primary/30 bg-background-dark p-8 shadow-2xl">
                <button
                    type="button"
                    className="absolute right-4 top-4 text-gray-400 hover:text-primary"
                    onClick={onClose}
                >
                    <span className="material-symbols-outlined text-2xl">close</span>
                </button>
                <h2 className="mb-6 text-2xl font-semibold text-text-light">
                    {branch.name} 리뷰
                </h2>

                <div className="mb-6 flex items-center gap-4">
                    <div className="text-4xl font-bold text-primary">
                        ⭐ {reviews.averageRating?.toFixed(1) || 'N/A'}
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">총 {reviews.totalCount || 0}개의 리뷰</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {reviews.reviews?.map((review) => (
                        <div key={review.userId + '-' + review.createdAt} className="rounded-lg border border-border-dark/60 bg-background-dark/60 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-text-light">{review.userNickname}</span>
                                    <span className="text-sm text-gray-400">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-yellow-400">⭐</span>
                                    <span className="text-sm font-medium">{review.gRating}</span>
                                </div>
                            </div>
                            <p className="text-gray-200">{review.gReview}</p>
                        </div>
                    )) || <p className="text-gray-400">리뷰가 없습니다.</p>}
                </div>
            </div>
        </div>
    )
}

const FormInput = ({ label, name, value, onChange, placeholder, required }) => (
    <label className="block text-sm">
        <span className="mb-1 inline-flex items-center gap-1 text-gray-300">
            {label}
            {required && <span className="text-primary">*</span>}
        </span>
        <input
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="block w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
    </label>
)

const FormTextarea = ({ label, name, value, onChange, placeholder }) => (
    <label className="block text-sm">
        <span className="mb-1 inline-flex items-center gap-1 text-gray-300">{label}</span>
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={3}
            className="block w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
    </label>
)

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