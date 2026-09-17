import { useState } from 'react'
import { useBootstrap } from '../api/ApiProvider'

export function FlashMessages() {
  const { flash } = useBootstrap()
  const [visible, setVisible] = useState({ success: true, failure: true })

  return (
    <>
      {flash.success && visible.success && (
        <div className="flash success">{flash.success}<button type="button" onClick={() => setVisible({ ...visible, success: false })}>×</button></div>
      )}
      {flash.failure && visible.failure && (
        <div className="flash failure">{flash.failure}<button type="button" onClick={() => setVisible({ ...visible, failure: false })}>×</button></div>
      )}
    </>
  )
}
