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

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
      dispatch(clearCrmPresence())
    }
  }, [dispatch, navigate, token])

  return null
}
