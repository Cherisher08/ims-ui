import { Modal } from '@mui/material';
import { useEffect, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { toast } from 'react-toastify';
import CustomButton from '../../../../styled/CustomButton';
import CustomInput from '../../../../styled/CustomInput';
import {
  useRequestAadhaarOtpMutation,
  useVerifyAadhaarOtpMutation,
  type VerifyOtpResponse,
} from '../../../../services/ContactService';

// ─── Types ─────────────────────────────────────────────────────────────────

export type AadhaarOtpModalProps = {
  open: boolean;
  contactId: string;
  onClose: () => void;
  onVerified?: (data: VerifyOtpResponse) => void;
};

// ─── Step indicators ────────────────────────────────────────────────────────

type Step = 'enter_uid' | 'enter_otp' | 'success';

// ─── Component ──────────────────────────────────────────────────────────────

const AadhaarOtpModal = ({ open, contactId, onClose, onVerified }: AadhaarOtpModalProps) => {
  const [step, setStep] = useState<Step>('enter_uid');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [clientId, setClientId] = useState('');
  const [verifiedData, setVerifiedData] = useState<VerifyOtpResponse | null>(null);
  const [aadhaarError, setAadhaarError] = useState('');
  const [otpError, setOtpError] = useState('');

  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestAadhaarOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyAadhaarOtpMutation();

  // Reset state whenever modal opens
  useEffect(() => {
    if (open) {
      setStep('enter_uid');
      setAadhaarNumber('');
      setOtp('');
      setClientId('');
      setVerifiedData(null);
      setAadhaarError('');
      setOtpError('');
    }
  }, [open]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSendOtp = async () => {
    const cleaned = aadhaarNumber.replace(/\s/g, '');
    if (!/^\d{12}$/.test(cleaned)) {
      setAadhaarError('Aadhaar number must be exactly 12 digits');
      return;
    }
    setAadhaarError('');

    try {
      const result = await requestOtp({
        aadhaar_number: cleaned,
        contact_id: contactId,
      }).unwrap();

      setClientId(result.client_id);
      setStep('enter_otp');
      toast.info('OTP sent to the Aadhaar-linked mobile number');
    } catch (err: unknown) {
      const message =
        (err as { data?: { detail?: string } })?.data?.detail ??
        'Failed to send OTP. Please try again.';
      toast.error(message);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setOtpError('Please enter the 6-digit OTP');
      return;
    }
    setOtpError('');

    try {
      const result = await verifyOtp({
        client_id: clientId,
        otp,
        contact_id: contactId,
      }).unwrap();

      setVerifiedData(result);
      setStep('success');
      onVerified?.(result);
      toast.success('Aadhaar verified successfully!');
    } catch (err: unknown) {
      const message =
        (err as { data?: { detail?: string } })?.data?.detail ??
        'OTP verification failed. Please try again.';
      toast.error(message);
    }
  };

  // ── Render helpers ──────────────────────────────────────────────────────────

  const formatAadhaar = (value: string) => {
    // Allow only digits and auto-format as XXXX XXXX XXXX
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-4">
      {(['enter_uid', 'enter_otp', 'success'] as Step[]).map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
              ${step === s
                ? 'bg-primary text-white scale-110'
                : i < ['enter_uid', 'enter_otp', 'success'].indexOf(step)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
          >
            {i < ['enter_uid', 'enter_otp', 'success'].indexOf(step)
              ? <FaCheckCircle size={14} />
              : i + 1}
          </div>
          {i < 2 && (
            <div
              className={`h-0.5 w-8 transition-all duration-300 ${
                i < ['enter_uid', 'enter_otp', 'success'].indexOf(step)
                  ? 'bg-green-500'
                  : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="w-screen h-screen flex justify-center items-center"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-5 outline-none">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-primary text-xl" />
            <p className="text-primary text-lg font-semibold">Aadhaar Verification</p>
          </div>
          <MdClose
            size={22}
            className="cursor-pointer text-gray-500 hover:text-gray-800 transition-colors"
            onClick={onClose}
          />
        </div>

        <StepIndicator />

        {/* ── Step 1: Enter Aadhaar UID ─────────────────────────────────── */}
        {step === 'enter_uid' && (
          <div className="flex flex-col gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700">
              Enter the customer's 12-digit Aadhaar number. An OTP will be sent to their
              Aadhaar-linked mobile number.
            </div>

            <CustomInput
              label="Aadhaar Number"
              value={formatAadhaar(aadhaarNumber)}
              onChange={(val) => {
                setAadhaarNumber(val.replace(/\s/g, ''));
                setAadhaarError('');
              }}
              placeholder="XXXX XXXX XXXX"
              error={!!aadhaarError}
              helperText={aadhaarError}
            />

            <div className="flex gap-3 justify-end mt-2">
              <CustomButton
                onClick={onClose}
                label="Cancel"
                variant="outlined"
                className="bg-white"
              />
              <CustomButton
                onClick={handleSendOtp}
                label={isRequestingOtp ? 'Sending OTP…' : 'Send OTP'}
                disabled={isRequestingOtp || aadhaarNumber.replace(/\s/g, '').length !== 12}
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Enter OTP ──────────────────────────────────────────── */}
        {step === 'enter_otp' && (
          <div className="flex flex-col gap-4">
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-700">
              An OTP has been sent to the mobile number linked with Aadhaar number&nbsp;
              <strong>{formatAadhaar(aadhaarNumber)}</strong>. Please ask the customer
              to share the OTP.
            </div>

            <CustomInput
              label="Enter OTP"
              value={otp}
              onChange={(val) => {
                setOtp(val.replace(/\D/g, '').slice(0, 6));
                setOtpError('');
              }}
              placeholder="6-digit OTP"
              error={!!otpError}
              helperText={otpError}
            />

            <div className="flex gap-3 justify-between mt-2">
              <CustomButton
                onClick={() => setStep('enter_uid')}
                label="← Change UID"
                variant="outlined"
                className="bg-white"
              />
              <div className="flex gap-2">
                <CustomButton
                  onClick={onClose}
                  label="Cancel"
                  variant="outlined"
                  className="bg-white"
                />
                <CustomButton
                  onClick={handleVerifyOtp}
                  label={isVerifyingOtp ? 'Verifying…' : 'Verify OTP'}
                  disabled={isVerifyingOtp || otp.length !== 6}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Success ────────────────────────────────────────────── */}
        {step === 'success' && verifiedData && (
          <div className="flex flex-col gap-4">
            {/* Success banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-4 flex items-center gap-3">
              <MdVerified className="text-green-600 text-3xl flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-700">Aadhaar Verified!</p>
                <p className="text-xs text-green-600">
                  The customer's Aadhaar has been verified and details are saved.
                </p>
              </div>
            </div>

            {/* Demographic details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {verifiedData.aadhaar_name && (
                <div className="col-span-2">
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Name</p>
                  <p className="font-medium text-gray-800">{verifiedData.aadhaar_name}</p>
                </div>
              )}
              {verifiedData.aadhaar_masked_uid && (
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Aadhaar UID</p>
                  <p className="font-medium text-gray-800 font-mono">
                    {verifiedData.aadhaar_masked_uid}
                  </p>
                </div>
              )}
              {verifiedData.aadhaar_dob && (
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Date of Birth</p>
                  <p className="font-medium text-gray-800">{verifiedData.aadhaar_dob}</p>
                </div>
              )}
              {verifiedData.aadhaar_gender && (
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Gender</p>
                  <p className="font-medium text-gray-800">{verifiedData.aadhaar_gender}</p>
                </div>
              )}
              {verifiedData.aadhaar_address && (
                <div className="col-span-2">
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Address</p>
                  <p className="font-medium text-gray-800 text-xs leading-relaxed">
                    {verifiedData.aadhaar_address}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-1">
              <CustomButton onClick={onClose} label="Done" />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AadhaarOtpModal;
