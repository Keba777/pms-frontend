import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Meeting {
    id: string
    title: string
    date: string
    time: string
}

interface MeetingStore {
    meetings: Meeting[]
    addMeeting: (meeting: Omit<Meeting, 'id'>) => void
    removeMeeting: (id: string) => void
}

export const useMeetingStore = create<MeetingStore>()(
    persist(
        (set) => ({
            meetings: [],
            addMeeting: (meeting) =>
                set((state) => ({
                    meetings: [
                        ...state.meetings,
                        { ...meeting, id: crypto.randomUUID() },
                    ],
                })),
            removeMeeting: (id) =>
                set((state) => ({
                    meetings: state.meetings.filter((m) => m.id !== id),
                })),
        }),
        { name: 'meetings-storage' }
    )
)
