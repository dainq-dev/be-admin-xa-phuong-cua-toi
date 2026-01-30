/**
 * Login Page (Đăng nhập)
 * OTP-based authentication for admin users
 */

import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthViewModel } from '@/domains/auth/viewmodels/auth.viewmodel'
import { useAuthStore } from '@/stores/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OTPInput } from '@/components/ui/otp-input'
import { Mail, ArrowLeft, Loader2, AlertCircle, KeyRound } from 'lucide-react'
import '@/components/ui/otp-input.css'

export default function DangNhap() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()

  const {
    email,
    setEmail,
    emailError,
    otp,
    setOTP,
    otpError,
    isOTPSent,
    isLoading,
    error,
    otpCountdown,
    requestOTP,
    verifyOTPAndLogin,
    resetForm,
  } = useAuthViewModel()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  // Handle email form submit
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    await requestOTP()
  }

  // Handle OTP form submit
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    await verifyOTPAndLogin()
  }

  // Handle back to email step
  const handleBackToEmail = () => {
    resetForm()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-primary font-bold text-lg">PX</span>
          </div>
          <CardTitle className="text-2xl">Đăng nhập Admin</CardTitle>
          <CardDescription>
            {!isOTPSent
              ? 'Nhập email để nhận mã xác thực OTP'
              : `Mã OTP đã được gửi đến ${email}`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Step 1: Email Input */}
          {!isOTPSent ? (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@phuongxa.gov.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                {emailError && (
                  <p className="text-sm text-red-500">{emailError}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  'Gửi mã OTP'
                )}
              </Button>
            </form>
          ) : (
            /* Step 2: OTP Verification */
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-3">
                <Label className="text-center block">Nhập mã OTP (6 chữ số)</Label>
                <OTPInput
                  value={otp}
                  onChange={setOTP}
                  disabled={isLoading}
                  isVerifying={isLoading}
                />
                {otpError && (
                  <p className="text-sm text-red-500 text-center">{otpError}</p>
                )}
                
                <p className="text-xs text-gray-500 text-center">
                  {otpCountdown > 0 
                    ? `Mã OTP có hiệu lực trong ${Math.floor(otpCountdown / 60)}:${String(otpCountdown % 60).padStart(2, '0')}`
                    : 'Mã OTP đã hết hạn, vui lòng gửi lại'}
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </Button>

              {/* Resend OTP & Back */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToEmail}
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Đổi email
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={requestOTP}
                  disabled={isLoading || otpCountdown > 0}
                >
                  {otpCountdown > 0 ? `Gửi lại (${otpCountdown}s)` : 'Gửi lại OTP'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
