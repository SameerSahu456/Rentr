import { useEffect, useRef } from 'react'

export default function OtpInput({
  otp = ['', '', '', ''],
  setOtp,
  length = 4,
  className = '',
}) {
  const inputRefs = useRef([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[index] = val
    setOtp(next)
    if (val && index < length - 1) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (text.length) {
      const next = [...otp]
      text.split('').forEach((char, i) => { next[i] = char })
      setOtp(next)
      inputRefs.current[Math.min(text.length, length - 1)]?.focus()
      e.preventDefault()
    }
  }

  return (
    <div className={`flex justify-center gap-4 mb-4 ${className}`}>
      {otp.map((digit, i) => (
        <div key={i} className="flex flex-col items-center">
          <input
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className="w-12 h-12 text-center text-xl font-semibold font-body border-b-2 border-gray-300 focus:border-[#6d5ed6] outline-none bg-transparent text-[#333]"
          />
        </div>
      ))}
    </div>
  )
}
