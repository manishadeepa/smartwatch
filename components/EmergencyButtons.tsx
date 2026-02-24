'use client';

import { Button } from '@/components/ui/button';
import { Phone, Check, X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface EmergencyButtonsProps {
  onAccept: () => void;
  onDecline: () => void;
  onCallPatient: () => void;
  onCallAmbulance: () => void;
  disabled?: boolean;
}

export function EmergencyButtons({
  onAccept,
  onDecline,
  onCallPatient,
  onCallAmbulance,
  disabled = false,
}: EmergencyButtonsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onAccept();
      toast.success('Alert accepted - Response initiated');
      setIsProcessing(false);
    }, 500);
  };

  const handleDecline = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onDecline();
      toast.warning('Alert declined - Escalating to next contact');
      setIsProcessing(false);
    }, 500);
  };

  const handleCallPatient = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onCallPatient();
      toast.info('Initiating call to patient...');
      setIsProcessing(false);
    }, 500);
  };

  const handleCallAmbulance = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onCallAmbulance();
      toast.error('Emergency ambulance requested');
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:flex md:gap-2">
      <Button
        onClick={handleAccept}
        disabled={disabled || isProcessing}
        className="flex-1 gap-2 bg-safe hover:bg-safe/90 text-white"
      >
        <Check size={20} />
        <span className="hidden sm:inline">ACCEPT</span>
        <span className="sm:hidden">Accept</span>
      </Button>

      <Button
        onClick={handleDecline}
        disabled={disabled || isProcessing}
        className="flex-1 gap-2 bg-warning hover:bg-warning/90 text-white"
      >
        <X size={20} />
        <span className="hidden sm:inline">DECLINE</span>
        <span className="sm:hidden">Decline</span>
      </Button>

      <Button
        onClick={handleCallPatient}
        disabled={disabled || isProcessing}
        className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-white"
      >
        <Phone size={20} />
        <span className="hidden sm:inline">CALL</span>
        <span className="sm:hidden">Call</span>
      </Button>

      <Button
        onClick={handleCallAmbulance}
        disabled={disabled || isProcessing}
        className="flex-1 gap-2 bg-emergency hover:bg-emergency/90 text-white"
      >
        <AlertTriangle size={20} />
        <span className="hidden sm:inline">AMBULANCE</span>
        <span className="sm:hidden">Ambulance</span>
      </Button>
    </div>
  );
}
