import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface VerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactMethod: string; // phone number or email
  isEmail: boolean;
  onBack: () => void;
  onVerified: () => void;
}

export function VerificationModal({
  open,
  onOpenChange,
  contactMethod,
  isEmail,
  onBack,
  onVerified,
}: VerificationModalProps) {
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Refs for each input
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start resend timer when modal opens
  useEffect(() => {
    if (open) {
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [open]);

  // Focus first input when modal opens
  useEffect(() => {
    if (open && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [open]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digits
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // No longer auto-verify - just let user click verify button
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace to move to previous input
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 6);
        if (digits.length === 6) {
          const newCode = digits.split("");
          setVerificationCode(newCode);
          inputRefs.current[5]?.focus();
          handleVerify(newCode);
        }
      });
    }
  };

  const handleVerify = (code: string[] = verificationCode) => {
    const codeString = code.join("");

    // Auto-verify if all 6 digits are numeric
    if (codeString.length === 6 && /^\d{6}$/.test(codeString)) {
      onVerified();
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    setIsResending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsResending(false);
    setResendTimer(60);

    // Reset code and focus first input
    setVerificationCode(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const handleManualVerify = () => {
    handleVerify();
  };

  const isCodeComplete = verificationCode.every((digit) => digit !== "");
  const maskedContact = isEmail
    ? contactMethod.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : contactMethod
        .replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-**$3")
        .slice(0, -2) + "**";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border-0 p-8 bg-white">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            We sent you a code
          </DialogTitle>
        </div>

        <DialogDescription className="sr-only">
          Enter the 6-digit verification code we sent to your{" "}
          {isEmail ? "email" : "phone number"}.
        </DialogDescription>

        <div className="space-y-6">
          {/* Description */}
          <div className="text-center">
            <p className="text-sm text-gray-600 leading-relaxed">
              Enter it below to verify your{" "}
              {isEmail ? "email address" : "phone number"}.
            </p>
            <p className="text-sm text-gray-900 mt-1">{maskedContact}</p>
          </div>

          {/* Verification Code Inputs */}
          <div className="space-y-4">
            <div className="flex justify-center gap-3">
              {verificationCode.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-lg font-medium rounded-lg border-gray-200 focus:border-gray-300 focus:ring-0"
                />
              ))}
            </div>
          </div>

          {/* Resend Code */}
          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend code in {resendTimer}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending}
                className="text-sm text-blue-500 hover:underline disabled:text-gray-400"
              >
                {isResending ? "Sending..." : "Resend code"}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleManualVerify}
              disabled={!isCodeComplete}
              className={`w-full h-14 text-white rounded-full text-base font-medium transition-all ${
                isCodeComplete
                  ? "bg-gray-700 hover:bg-gray-800"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Verify
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full h-12 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full"
            >
              ← Go back
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
