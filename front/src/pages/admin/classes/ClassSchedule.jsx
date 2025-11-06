import { useEffect, useState } from 'react'
import { get } from '../../../lib/api'
import LeftSidebar from '../../../components/LeftSidebar'

const ClassSchedule = () => {
    const [scheduleData, setScheduleData] = useState([])
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [loading, setLoading] = useState(true)

    // 시간 슬롯 생성 (09:00 - 16:00)
    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00', 
        '13:00', '14:00', '15:00', '16:00'
    ]

    // 날짜 포맷팅
    const formatDate = (date) => {
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
    }

    // 날짜 변경
    const changeDate = (days) => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() + days)
        setSelectedDate(newDate)
    }

    // 오늘로 이동
    const goToToday = () => {
        setSelectedDate(new Date())
    }

    // 수업 데이터 조회
    const fetchSchedule = async () => {
        try {
            setLoading(true)
            const response = await get('/api/admin/classes/schedule')
            setScheduleData(response.data || [])
        } catch (error) {
            console.error('수업 스케줄 조회 실패:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSchedule()
    }, [])

    // 트레이너 목록 추출 (중복 제거)
    const getTrainers = () => {
        const trainers = new Map()
        scheduleData.forEach(item => {
            if (!trainers.has(item.trainer.tid)) {
                trainers.set(item.trainer.tid, {
                    id: item.trainer.tid,
                    name: item.trainer.tname,
                    image: `https://via.placeholder.com/40x40?text=${item.trainer.tname.charAt(0)}`
                })
            }
        })
        return Array.from(trainers.values())
    }

    // 특정 시간과 트레이너에 해당하는 수업 찾기
    const findClassAtTime = (timeSlot, trainerId) => {
        const [hour] = timeSlot.split(':').map(Number)
        
        return scheduleData.find(item => {
            if (item.trainer.tid !== trainerId) return false
            
            const startHour = new Date(item.startdatetime).getHours()
            const endHour = new Date(item.enddatetime).getHours()
            
            return hour >= startHour && hour < endHour
        })
    }

    // 수업 상태 계산
    const getClassStatus = (classItem) => {
        if (!classItem) return null
        
        const now = new Date()
        const startTime = new Date(classItem.startdatetime)
        const endTime = new Date(classItem.enddatetime)
        
        if (now > endTime) return 'ended'
        if (now >= startTime) return 'ongoing'
        return 'upcoming'
    }

    // 수업 카드 렌더링
    const renderClassCard = (classItem) => {
        if (!classItem) return null
        
        const status = getClassStatus(classItem)
        const isFull = classItem.remaining <= 0
        
        return (
            <div className="bg-surface-light border border-border-light rounded-lg p-3 h-full flex flex-col justify-between">
                <p className="font-bold text-base">{classItem.classname}</p>
                <div className="flex justify-between items-center">
                    <p className="text-sm">
                        {classItem.reserved}/{classItem.maxcapacity}명
                    </p>
                    <button 
                        className={`text-xs font-bold py-1 px-3 rounded-full ${
                            isFull || status === 'ended' 
                                ? 'bg-gray-600 text-white cursor-not-allowed' 
                                : 'bg-primary text-white hover:bg-red-700'
                        }`}
                        disabled={isFull || status === 'ended'}
                    >
                        {isFull ? '마감' : status === 'ended' ? '종료' : '예약 가능'}
                    </button>
                </div>
            </div>
        )
    }

    const trainers = getTrainers()

    if (loading) {
        return (
            <div className="flex min-h-screen bg-background-dark">
                <LeftSidebar />
                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-400">로딩 중...</div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-background-dark">
            <LeftSidebar />
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
                <div className="layout-content-container flex flex-col max-w-full mx-auto gap-8">
                    {/* 헤더 */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="text-2xl font-bold text-text-light">수업 스케줄</h2>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => changeDate(-1)}
                                className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-surface-light hover:bg-surface-dark border border-border-light"
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <span className="text-lg font-medium text-text-light">
                                {formatDate(selectedDate)}
                            </span>
                            <button 
                                onClick={() => changeDate(1)}
                                className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-surface-light hover:bg-surface-dark border border-border-light"
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                            <button 
                                onClick={goToToday}
                                className="flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-surface-light hover:bg-surface-dark border border-border-light px-4 text-sm font-bold"
                            >
                                오늘
                            </button>
                        </div>
                    </div>

                    {/* 스케줄 테이블 */}
                    <div className="flex flex-col flex-1 border border-border-light rounded-lg overflow-hidden">
                        {/* 헤더 */}
                        <div className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-border-light">
                            <div className="p-4 text-center font-bold text-subtle-text-light">시간</div>
                            {trainers.slice(0, 5).map(trainer => (
                                <div key={trainer.id} className="p-4 text-center font-bold flex items-center justify-center gap-2">
                                    <img 
                                        alt={`${trainer.name} 트레이너`} 
                                        className="w-8 h-8 rounded-full object-cover" 
                                        src={trainer.image}
                                    />
                                    <span>{trainer.name}</span>
                                </div>
                            ))}
                        </div>

                        {/* 시간 슬롯 */}
                        <div className="grid grid-cols-[80px_repeat(5,1fr)] h-full">
                            {/* 시간 라벨 */}
                            <div className="flex flex-col">
                                {timeSlots.map((time, index) => (
                                    <div 
                                        key={time} 
                                        className={`h-24 flex items-center justify-center border-r border-border-light ${
                                            index < timeSlots.length - 1 ? 'border-b' : ''
                                        }`}
                                    >
                                        <span className="text-sm font-semibold text-subtle-text-light">{time}</span>
                                    </div>
                                ))}
                            </div>

                            {/* 수업 그리드 */}
                            <div className="grid grid-cols-1 grid-rows-[repeat(8,96px)] col-span-5">
                                {timeSlots.map((timeSlot) => (
                                    trainers.slice(0, 5).map((trainer) => {
                                        const classItem = findClassAtTime(timeSlot, trainer.id)
                                        
                                        if (classItem) {
                                            // 수업 지속 시간 계산
                                            const startHour = new Date(classItem.startdatetime).getHours()
                                            const endHour = new Date(classItem.enddatetime).getHours()
                                            const duration = endHour - startHour
                                            
                                            return (
                                                <div 
                                                    key={`${timeSlot}-${trainer.id}`}
                                                    className={`p-2 ${
                                                        timeIndex === startHour - 9 ? `row-start-${timeIndex + 1}` : ''
                                                    } row-span-${duration}`}
                                                >
                                                    {renderClassCard(classItem)}
                                                </div>
                                            )
                                        }
                                        
                                        return null
                                    })
                                ))}
                                
                                {/* 그리드 라인 */}
                                {timeSlots.map((_, timeIndex) => (
                                    trainers.slice(0, 5).map((_, trainerIndex) => (
                                        <div 
                                            key={`grid-${timeIndex}-${trainerIndex}`}
                                            className={`${
                                                trainerIndex < trainers.length - 1 ? 'border-r' : ''
                                            } ${
                                                timeIndex < timeSlots.length - 1 ? 'border-b' : ''
                                            } border-border-light`}
                                        />
                                    ))
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default ClassSchedule