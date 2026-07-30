import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  connectCrmSocket,
  getUserIdFromSocketPayload,
  resolveCrmSocketUrl,
} from '@/lib/crm-socket'
import { useAppDispatch, useAppSelector } from '@/store'
import { logout } from '@/store/authSlice'
import {
  clearCrmPresence,
  crmUserConnected,
  crmUserDisconnected,
} from '@/store/crmPresenceSlice'
import {
  appendCoachNote,
  appendLiveTranscriptLine,
  applyVoiceScriptSuggestion,
  type CoachNote,
  type LiveTranscriptLine,
  type VoiceScriptSuggestion,
} from '@/store/twilioVoiceSlice'
import {
  isCallObjectionId,
  isCallStageId,
  isProjectPillId,
} from '@/features/Clients/call-script/ventor-call-script'

export function CrmSocketListener() {
  const token = useAppSelector((s) => s.auth.user?.token)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) return
    if (!resolveCrmSocketUrl()) return

    const socket = connectCrmSocket(token)
    if (!socket) return

    socket.on('connect', () => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.info('[crm-socket] connected')
      }
    })

    socket.on('disconnect', () => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.info('[crm-socket] disconnected')
      }
    })

    socket.on('userConnected', (payload: unknown) => {
      const id = getUserIdFromSocketPayload(payload)
      if (id) dispatch(crmUserConnected(id))
    })

    socket.on('userDisconnected', (payload: unknown) => {
      const id = getUserIdFromSocketPayload(payload)
      if (id) dispatch(crmUserDisconnected(id))
    })

    socket.on('disabled', () => {
      dispatch(logout())
      navigate('/login', { replace: true })
    })

    socket.on('hardOff', () => {
      window.setTimeout(() => {
        dispatch(logout())
        navigate('/login', { replace: true })
      }, 2000)
    })

    socket.on('reload', () => {
      window.location.reload()
    })

    socket.on('voiceCoachNote', (payload: unknown) => {
      if (!payload || typeof payload !== 'object') return
      const o = payload as Record<string, unknown>
      const callSid = typeof o.callSid === 'string' ? o.callSid : ''
      const message = typeof o.message === 'string' ? o.message : ''
      const supervisorName =
        typeof o.supervisorName === 'string' ? o.supervisorName : 'Supervisor'
      const sentAt = typeof o.sentAt === 'string' ? o.sentAt : new Date().toISOString()
      if (!callSid || !message) return
      const note: CoachNote = { callSid, message, supervisorName, sentAt }
      dispatch(appendCoachNote(note))
    })

    socket.on('voiceTranscriptPartial', (payload: unknown) => {
      if (!payload || typeof payload !== 'object') return
      const o = payload as Record<string, unknown>
      const callSid = typeof o.callSid === 'string' ? o.callSid : ''
      const text = typeof o.text === 'string' ? o.text : ''
      if (!callSid || !text) return
      const line: LiveTranscriptLine = {
        callSid,
        text,
        isFinal: o.isFinal === true,
        speaker: typeof o.speaker === 'string' ? o.speaker : null,
        sentAt: typeof o.sentAt === 'string' ? o.sentAt : new Date().toISOString(),
      }
      dispatch(appendLiveTranscriptLine(line))
    })

    socket.on('voiceScriptSuggestion', (payload: unknown) => {
      if (!payload || typeof payload !== 'object') return
      const o = payload as Record<string, unknown>
      const callSid = typeof o.callSid === 'string' ? o.callSid : ''
      const stageId = typeof o.stageId === 'string' ? o.stageId : ''
      if (!callSid || !isCallStageId(stageId)) return
      const objectionRaw = typeof o.objectionId === 'string' ? o.objectionId : null
      const pillRaw = typeof o.projectPillId === 'string' ? o.projectPillId : null
      const suggestion: VoiceScriptSuggestion = {
        callSid,
        stageId,
        objectionId: objectionRaw && isCallObjectionId(objectionRaw) ? objectionRaw : null,
        projectPillId: pillRaw && isProjectPillId(pillRaw) ? pillRaw : null,
        replyIds: Array.isArray(o.replyIds)
          ? o.replyIds.filter((id): id is string => typeof id === 'string')
          : [],
        confidence: typeof o.confidence === 'number' ? o.confidence : 0,
        reason: typeof o.reason === 'string' ? o.reason : '',
        sentAt: typeof o.sentAt === 'string' ? o.sentAt : new Date().toISOString(),
      }
      dispatch(applyVoiceScriptSuggestion(suggestion))
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
      dispatch(clearCrmPresence())
    }
  }, [dispatch, navigate, token])

  return null
}
