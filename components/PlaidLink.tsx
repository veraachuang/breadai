'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Loader2 } from 'lucide-react';
import { api } from '../app/_trpc/react';
import { useSession } from 'next-auth/react';
import Script from 'next/script';
import { 
  usePlaidLink,
  PlaidLinkOptions,
  PlaidLinkError,
  PlaidLinkOnEventMetadata,
  PlaidLinkOnSuccessMetadata,
  PlaidLinkOnSuccess,
  PlaidLinkOnEvent,
  PlaidLinkOnExit
} from 'react-plaid-link';

export default function PlaidLink() {
  const router = useRouter();
  const { data: session } = useSession();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptReady, setIsScriptReady] = useState(false);

  const { mutateAsync: createToken } = api.plaid.createLinkToken.useMutation();
  const { mutateAsync: exchangeToken } = api.plaid.exchangePublicToken.useMutation();

  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (publicToken, metadata) => {
    try {
      setIsLoading(true);
      console.log('Plaid Link success, exchanging token...', metadata);
      await exchangeToken({ publicToken });
      router.push('/dashboard');
    } catch (err) {
      console.error('Error exchanging token:', err);
      setError('Failed to connect bank. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [exchangeToken, router]);

  const config: PlaidLinkOptions = {
    token,
    onSuccess,
    onExit: (error: PlaidLinkError | null) => {
      console.log('Plaid Link exit:', error);
      setError(error ? 'Connection failed. Please try again.' : 'Connection cancelled.');
      setIsLoading(false);
    },
    onEvent: (eventName: string, metadata: PlaidLinkOnEventMetadata) => {
      console.log('Plaid Link event:', eventName, metadata);
    }
  };

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    const initializePlaid = async () => {
      if (!session) return;
      
      try {
        setIsLoading(true);
        setError(null);
        console.log('Creating link token...');
        const response = await createToken();
        console.log('Link token created successfully');
        setToken(response.linkToken);
      } catch (err: any) {
        console.error('Error creating link token:', err);
        setError('Failed to initialize bank connection. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (!token && isScriptReady) {
      initializePlaid();
    }
  }, [session, token, createToken, isScriptReady]);

  // Effect to automatically open Plaid when token is ready
  useEffect(() => {
    if (token && ready && !isLoading) {
      console.log('Opening Plaid Link...');
      open();
    }
  }, [token, ready, open, isLoading]);

  const handleClick = useCallback(() => {
    if (!session) {
      setError('Please log in to connect your bank account');
      return;
    }
    
    setError(null);
    setToken(null); // This will trigger the token creation flow
  }, [session]);

  return (
    <div className="flex flex-col items-center space-y-6">
      <Script
        src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Plaid script loaded');
          setIsScriptReady(true);
        }}
        onError={(e) => {
          console.error('Plaid script load error:', e);
          setError('Failed to load Plaid. Please refresh the page.');
        }}
      />

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
        onClick={handleClick}
        disabled={!isScriptReady || isLoading}
        className="w-full bg-[#9c6644] text-white py-3 px-4 rounded-xl hover:bg-[#8b5a3b] transition-colors disabled:opacity-50 font-medium flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          'Connect Your Bank'
        )}
      </button>
    </div>
  );
} 