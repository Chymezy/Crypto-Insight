declare module 'react-qr-scanner' {
  import React from 'react';

  interface QrScannerProps {
    delay?: number;
    onError: (error: any) => void;
    onScan: (data: { text: string } | null) => void;
    style?: React.CSSProperties;
  }

  const QrScanner: React.FC<QrScannerProps>;

  export default QrScanner;
}
