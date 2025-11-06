import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiJson, put, presignUpload, getViewUrl } from '../../../lib/api'

const BranchEdit = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [formValues, setFormValues] = useState({
        name: '',
        address: '',
        phone: '',
        operatingHours: '',
        parkingInfo: '',
        stations: '',
        image: '',
    })
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState('')
    const [uploading, setUploading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBranch()
    }, [id])

    const fetchBranch = async () => {
        try {
            console.log('=== BRANCH EDIT FETCH START ===')
            console.log('1. Fetching branch data for ID:', id)
            console.log('2. API Endpoint:', `/api/branches/${id}`)
            
            const response = await apiJson(`/api/branches/${id}`)
            console.log('3. Raw API Response:', response)
            console.log('4. Response status:', response.status)
            console.log('5. Response ok:', response.ok)
            console.log('6. Response data type:', typeof response.data)
            console.log('7. Response data:', response.data)
            
            const branch = response.data
            console.log('6. Branch object:', branch)
            console.log('7. Branch keys:', Object.keys(branch || {}))
            
            if (branch) {
                console.log('8. Branch fields:')
                console.log('   - gName:', branch.gName)
                console.log('   - gAddress:', branch.gAddress)
                console.log('   - gTel:', branch.gTel)
                console.log('   - gWorkoutDuration:', branch.gWorkoutDuration)
                console.log('   - gParking:', branch.gParking)
                console.log('   - gImageUrl:', branch.gImageUrl)
                console.log('   - stations:', branch.stations)
                console.log('   - stations length:', branch.stations?.length || 0)
            }
            
            // API 응답을 폼 형식으로 변환
            const formValues = {
                name: branch.gName || '',
                address: branch.gAddress || '',
                phone: branch.gTel || '',
                operatingHours: branch.gWorkoutDuration || '',
                parkingInfo: branch.gParking || '',
                stations: branch.stations?.map(station =>
                    `${station.stationLine}|${station.stationName}|${station.walkTime}`
                ).join('\n') || '',
                image: branch.gImageUrl || '',
            }
            console.log('9. Form values to set:', formValues)
            console.log('10. Setting form values...')
            setFormValues(formValues)
            console.log('11. Setting image preview:', branch.gImageUrl)
            setImagePreview(branch.gImageUrl || '')
            console.log('12. Form values and image preview set successfully')
        } catch (error) {
            console.error('=== BRANCH EDIT FETCH ERROR ===')
            console.error('Error object:', error)
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
            console.error('Error response:', error.response)
            console.error('Error status:', error.response?.status)
            console.error('Error status text:', error.response?.statusText)
            console.error('Error data:', error.response?.data)
            console.error('Error headers:', error.response?.headers)
        } finally {
            console.log('=== BRANCH EDIT FETCH END ===')
            setLoading(false)
        }
    }

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
        console.log('=== BRANCH EDIT SUBMIT START ===')
        console.log('1. Form values:', formValues)
        console.log('2. Image file:', imageFile)
        console.log('3. Current image URL:', formValues.image)

        try {
            let imageUrl = formValues.image

            // 이미지 파일이 있으면 S3 업로드
            if (imageFile) {
                console.log('4. Starting S3 upload process...')
                setUploading(true)
                
                console.log('5. Requesting presigned URL...')
                const { key, putUrl, imageId } = await presignUpload({
                    filename: imageFile.name,
                    contentType: imageFile.type,
                    contentLength: imageFile.size,
                    description: `${formValues.name} 지점 이미지`,
                    imageType: 'PROFILE' // 지점 이미지 타입
                })
                console.log('6. Presigned URL received:', { key, putUrl, imageId })

                console.log('7. Uploading to S3...')
                // S3에 파일 업로드
                const xhr = new XMLHttpRequest()
                xhr.open('PUT', putUrl, true)
                xhr.setRequestHeader('Content-Type', imageFile.type)
                xhr.send(imageFile)

                await new Promise((resolve, reject) => {
                    xhr.onload = () => {
                        console.log('8. S3 upload response status:', xhr.status)
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve()
                        } else {
                            reject(new Error(`S3 upload failed with status ${xhr.status}`))
                        }
                    }
                    xhr.onerror = () => {
                        console.error('9. S3 upload error:', xhr)
                        reject(new Error('Upload failed'))
                    }
                })

                console.log('10. Getting view URL...')
                // 조회 URL 발급
                imageUrl = await getViewUrl(key)
                console.log('11. View URL received:', imageUrl)
                setUploading(false)
            } else {
                console.log('4. No image file to upload, using existing URL')
            }

            // 지점 수정 API 호출
            const branchData = {
                gName: formValues.name,
                gAddress: formValues.address,
                gTel: formValues.phone,
                gWorkoutDuration: formValues.operatingHours,
                gParking: formValues.parkingInfo,
                gLatitude: 0, // TODO: 지도에서 좌표 가져오기
                gLongitude: 0, // TODO: 지도에서 좌표 가져오기
                gImageUrl: imageUrl,
                // stations는 별도 처리 필요
            }

            console.log('12. Calling branch update API...')
            console.log('13. Branch data to send:', branchData)
            
            const updateResponse = await put(`/api/admin/branches/${id}`, branchData)
            console.log('14. Branch update response:', updateResponse)

            console.log('15. Branch updated successfully:', branchData)
            console.log('=== BRANCH EDIT SUBMIT SUCCESS ===')
            navigate('/admin/centers/branches', { replace: true })
        } catch (error) {
            console.error('=== BRANCH EDIT SUBMIT ERROR ===')
            console.error('Error object:', error)
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
            console.error('Error response:', error.response)
            console.error('Error status:', error.response?.status)
            console.error('Error data:', error.response?.data)
        } finally {
            setSubmitting(false)
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col bg-background-dark text-text-light">
                <main className="flex-1 px-6 py-12">
                    <div className="mx-auto w-full max-w-4xl rounded-2xl border border-border-dark/60 bg-background-dark/60 p-10 text-center">
                        지점 정보를 불러오는 중...
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-background-dark text-text-light">
            <main className="flex-1 px-6 py-12">
                <div className="mx-auto w-full max-w-4xl space-y-8 rounded-2xl border border-border-dark/60 bg-background-dark/60 p-10 backdrop-blur">
                    <header>
                        <p className="text-sm uppercase tracking-widest text-primary/80">Admin</p>
                        <h1 className="text-3xl font-bold text-text-light">지점 정보 수정</h1>
                        <p className="mt-2 text-sm text-gray-400">
                            지점 정보를 수정한 뒤 저장하면 목록에 바로 반영됩니다.
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

                        <FormTextarea
                            label="주변 역 정보"
                            name="stations"
                            value={formValues.stations}
                            onChange={handleChange}
                            placeholder="노선|역 이름|도보 거리 형태로 입력 (예: 2|강남역|도보 5분)"
                        />

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
                                {submitting || uploading ? '처리 중...' : '수정 완료'}
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

export default BranchEdit