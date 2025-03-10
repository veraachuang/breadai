'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock } from 'lucide-react';
import { api } from '../app/_trpc/react';
import { useSession } from 'next-auth/react';
import { PlaidLinkOnSuccess, PlaidLinkOnEvent, PlaidLinkOnExit } from 'react-plaid-link';

declare global {
  interface Window {
    Plaid: any;
  }
}

interface PlaidLinkProps {
  linkToken: string;
  onSuccess: PlaidLinkOnSuccess;
  onEvent?: PlaidLinkOnEvent;
  onExit?: PlaidLinkOnExit;
}

export default function PlaidLink({ linkToken, onSuccess, onEvent, onExit }: PlaidLinkProps) {
  const [isPlaidScriptLoaded, setIsPlaidScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const createLinkToken = api.plaid.createLinkToken.useMutation({
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    }
  });

  const exchangePublicToken = api.plaid.exchangePublicToken.useMutation({
    onSuccess: () => {
      router.push('/dashboard');
    },
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    }
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    script.onload = () => setIsPlaidScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePlaidLink = async () => {
    if (!session) {
      setError('Please log in to connect your bank account');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const { linkToken } = await createLinkToken.mutateAsync();

      const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: (public_token, metadata) => {
          console.log('Link success:', metadata);
          onSuccess(public_token, metadata);
        },
        onEvent: (eventName, metadata) => {
          console.log('Link event:', eventName, metadata);
          if (onEvent) onEvent(eventName, metadata);
        },
        onExit: (error, metadata) => {
          console.log('Link exit:', error, metadata);
          if (onExit) onExit(error, metadata);
        },
      });

      open();
    } catch (error) {
      setError('Failed to initialize Plaid Link');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center space-x-6">
        <div className="flex items-center text-[#3a3027]">
          <Shield className="h-5 w-5 text-amber-600 mr-2" />
          <span className="text-sm">Bank-level security</span>
        </div>
        <div className="flex items-center text-[#3a3027]">
          <Lock className="h-5 w-5 text-amber-600 mr-2" />
          <span className="text-sm">256-bit encryption</span>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg w-full text-center">
          {error}
        </div>
      )}

      <button
        onClick={handlePlaidLink}
        disabled={!isPlaidScriptLoaded || isLoading}
        className="w-full bg-[#9c6644] text-white py-3 px-4 rounded-xl hover:bg-[#8b5a3b] transition-colors disabled:opacity-50 font-medium"
      >
        {isLoading ? 'Connecting...' : 'Connect Your Bank'}
      </button>
    </div>
  );
} 