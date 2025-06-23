import { useEffect, useState } from 'react';

// Helper functions
const isIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

const isInStandaloneMode = () =>
  'standalone' in window.navigator && window.navigator.standalone;

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (isIos() && !isInStandaloneMode()) {
      setTimeout(() => {
        setShowIosPrompt(true);
        setTimeout(() => {
          setShowIosPrompt(false);
        }, 10000);
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setTimeout(() => {
            setShowToast(true);
            setTimeout(() => {
              setShowToast(false);
            }, 4000);
          }, 6000);
        } else {
          console.log('User dismissed the install prompt');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
      });
    }
  };

  return (
    <div>
      {showPrompt && (
        <button
          onClick={handleInstallClick}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#FFFF00',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: 'pointer',
            animation: 'pulse 1.5s infinite',
            zIndex: 999,
          }}
        >
          Install App
        </button>
      )}
      {showIosPrompt && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '12px 20px',
            border: '1px solid #ffeeba',
            borderRadius: '5px',
            maxWidth: '250px',
            zIndex: 999,
          }}
        >
          <strong>Install this app:</strong>
          <br />
          Tap the <strong>Share</strong> button, then choose
          <br />
          <strong>&quot;Add to Home Screen&quot;</strong>.
        </div>
      )}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            backgroundColor: '#4BB543',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '5px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            animation: 'fadeInOut 4s ease-in-out',
          }}
        >
          Installed successfully! ✅
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }

          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(10px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(10px); }
          }
        `}
      </style>
    </div>
  );
};

export default InstallPrompt;