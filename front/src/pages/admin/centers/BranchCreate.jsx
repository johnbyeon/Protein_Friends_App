import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { post, presignUpload, getViewUrl } from '../../../lib/api'

const BranchCreate = () => {
    const navigate = useNavigate()
    const [formValues, setFormValues] = useState({
        name: '',
        address: '',
        phone: '',
        operatingHours: '',
        parkingInfo: '',
        stations: '',
        amenities: '',
        image: '',
        description: '',
    })
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState('')
    const [uploading, setUploading] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (event) => {
        const { name, value, files } = event.target

        if (name === 'imageFile' && files?.[0]) {
            const file = files[0]
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
            setFormValues((prev) => ({ ...prev, image: '' })) // URL 초기화
        } else {
            setFormValues((prev) => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSubmitting(true)

        try {
            let imageUrl = formValues.image

            // 이미지 파일이 있으면 S3 업로드
            if (imageFile) {
                setUploading(true)
                const { key, putUrl, imageId } = await presignUpload({
                    filename: imageFile.name,
                    contentType: imageFile.type,
                    contentLength: imageFile.size,
                    description: `${formValues.name} 지점 이미지`,
                    imageType: 'PROFILE' // 지점 이미지 타입
                })

                // S3에 파일 업로드
                const xhr = new XMLHttpRequest()
                xhr.open('PUT', putUrl, true)
                xhr.setRequestHeader('Content-Type', imageFile.type)
                xhr.send(imageFile)

                await new Promise((resolve, reject) => {
                    xhr.onload = () => resolve()
                    xhr.onerror = () => reject(new Error('Upload failed'))
                })

                // 조회 URL 발급
                imageUrl = await getViewUrl(key)
                setUploading(false)
            }

            // 지점 생성 API 호출
            const branchData = {
                gName: formValues.name,
                gAddress: formValues.address,
                gTel: formValues.phone,
                gWorkoutDuration: formValues.operatingHours,
                gParking: formValues.parkingInfo,
                gLatitude: 0, // TODO: 지도에서 좌표 가져오기
                gLongitude: 0, // TODO: 지도에서 좌표 가져오기
                gImageUrl: imageUrl,
                // stations와 amenities는 별도 처리 필요
            }

            await post('/api/admin/branches', branchData)

            console.log('Branch created successfully:', branchData)
            navigate('/admin/centers/branches', { replace: true })
        } catch (error) {
            console.error('Failed to create branch:', error)
            // TODO: 에러 처리
        } finally {
            setSubmitting(false)
            setUploading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-background-dark text-text-light">
            <main className="flex-1 px-6 py-12">
                <div className="mx-auto w-full max-w-4xl space-y-8 rounded-2xl border border-border-dark/60 bg-background-dark/60 p-10 backdrop-blur">
                    <header>
                        <p className="text-sm uppercase tracking-widest text-primary/80">Admin</p>
                        <h1 className="text-3xl font-bold text-text-light">새 피트니스 센터 지점 등록</h1>
                        <p className="mt-2 text-sm text-gray-400">
                            아래 양식을 작성한 뒤 저장하면 지점 목록에 바로 반영됩니다. 모든 필드는 임시 저장 없이 한 번에 제출돼요.
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <FormInput
                                label="지점명"
                                name="name"
                                value={formValues.name}
                                onChange={handleChange}
                                placeholder="예) 강남점"
                                required
                            />
                            <FormInput
                                label="대표 전화번호"
                                name="phone"
                                value={formValues.phone}
                                onChange={handleChange}
                                placeholder="예) 02-1234-5678"
                            />
                        </div>

                        <FormInput
                            label="주소"
                            name="address"
                            value={formValues.address}
                            onChange={handleChange}
                            placeholder="도로명 주소를 입력하세요."
                            required
                        />

                        <FormTextarea
                            label="상세 소개"
                            name="description"
                            value={formValues.description}
                            onChange={handleChange}
                            placeholder="지점 특징, 담당 프로그램 등을 자유롭게 작성하세요."
                            rows={4}
                        />

                        <div className="grid gap-6 md:grid-cols-2">
                            <FormTextarea
                                label="운영 시간"
                                name="operatingHours"
                                value={formValues.operatingHours}
                                onChange={handleChange}
                                placeholder="한 줄에 하나씩 입력 (예: 평일 06:00 - 24:00)"
                            />
                            <FormTextarea
                                label="주차 안내"
                                name="parkingInfo"
                                value={formValues.parkingInfo}
                                onChange={handleChange}
                                placeholder="주차 가능 여부, 시간 등 안내를 입력하세요."
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
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
                                placeholder="한 줄에 하나씩 입력 (예: 프라이빗 PT룸 6개)"
                            />
                        </div>

                         <div className="space-y-3">
                             <label className="block text-sm">
                                 <span className="mb-1 inline-flex items-center gap-1 text-gray-300">대표 이미지</span>
                                 <input
                                     type="file"
                                     name="imageFile"
                                     accept="image/*"
                                     onChange={handleChange}
                                     className="block w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:font-semibold file:text-black hover:file:opacity-90"
                                 />
                             </label>
                             {imagePreview && (
                                 <div className="rounded-lg border border-primary/20 p-4">
                                     <img src={imagePreview} alt="미리보기" className="h-32 w-full rounded-lg object-cover" />
                                 </div>
                             )}
                             <FormInput
                                 label="또는 이미지 URL 직접 입력"
                                 name="image"
                                 value={formValues.image}
                                 onChange={handleChange}
                                 placeholder="이미지 주소를 입력하세요."
                             />
                         </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/centers/branches')}
                                className="rounded-lg border border-border-dark px-4 py-2 text-sm text-gray-400 hover:text-text-light"
                            >
                                목록으로 돌아가기
                            </button>
                             <button
                                 type="submit"
                                 disabled={submitting || uploading}
                                 className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                 {submitting || uploading ? '처리 중...' : '등록 완료'}
                             </button>
                        </div>
                    </form>
                </div>
            </main>
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

const FormTextarea = ({ label, name, value, onChange, placeholder, rows = 3 }) => (
    <label className="block text-sm">
        <span className="mb-1 inline-flex items-center gap-1 text-gray-300">{label}</span>
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="block w-full rounded-lg border border-primary/20 bg-background-dark px-4 py-3 text-gray-200 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
    </label>
)

export default BranchCreate
