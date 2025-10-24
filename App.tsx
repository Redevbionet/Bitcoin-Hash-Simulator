import React, { useState, useCallback, useRef, useEffect } from 'react';

// --- Helper Functions for Crypto and UI ---

/**
 * Converts an ArrayBuffer to a hexadecimal string.
 * @param buffer The ArrayBuffer to convert.
 * @returns A hex string.
 */
const bufferToHex = (buffer: ArrayBuffer): string => {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Performs a double SHA-256 hash on a string, similar to Bitcoin.
 * @param data The string data to hash.
 * @returns A promise that resolves to the final hex string hash.
 */
const doubleSha256 = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataUint8 = encoder.encode(data);

  // First hash
  const hash1Buffer = await crypto.subtle.digest('SHA-256', dataUint8);
  
  // Second hash
  const hash2Buffer = await crypto.subtle.digest('SHA-256', hash1Buffer);

  return bufferToHex(hash2Buffer);
};

/**
 * Formats a number of hashes per second into a human-readable string (H/s, kH/s, MH/s).
 * @param hashesPerSecond The raw number of hashes per second.
 * @returns A formatted string.
 */
const formatHashRate = (hashesPerSecond: number): string => {
    if (hashesPerSecond < 1000) {
        return `${hashesPerSecond.toFixed(2)} H/s`;
    }
    if (hashesPerSecond < 1_000_000) {
        return `${(hashesPerSecond / 1000).toFixed(2)} kH/s`;
    }
    return `${(hashesPerSecond / 1_000_000).toFixed(2)} MH/s`;
};


// --- SVG Icon Components ---

const MiningIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.536a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM8 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM16 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z" />
    </svg>
);

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// --- Reusable UI Components ---

const HashingProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
    // progress: 0 (idle), 1 (pass 1), 2 (pass 2 complete)
    const progressPercentage = progress === 1 ? 50 : progress >= 2 ? 100 : 0;
    
    if (progress === 0) return null;

    return (
        <div className="my-4">
             <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-cyan-300">Hashing Progress</p>
                <p className="text-xs font-mono text-slate-400">{progress === 1 ? 'Pass 1/2' : 'Pass 2/2'}</p>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
    );
};

interface HashDisplayProps {
    title: string;
    hash: string | null;
    bgColorClass?: string;
}

const HashDisplay: React.FC<HashDisplayProps> = ({ title, hash, bgColorClass = "bg-slate-700/50" }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (hash) {
            navigator.clipboard.writeText(hash);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{title}</label>
            <div className={`flex items-center space-x-2 p-3 rounded-lg ${bgColorClass} font-mono text-sm break-all`}>
                <span className={hash ? 'text-emerald-300' : 'text-slate-500'}>{hash || '...'}</span>
                {hash && (
                    <button onClick={handleCopy} className="p-1 text-slate-400 hover:text-white transition-colors duration-200 shrink-0">
                        {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Main App Component ---

export default function App() {
    // State for basic hashing
    const [inputData, setInputData] = useState<string>('Hello Bitcoin!');
    const [hash1, setHash1] = useState<string | null>(null);
    const [hash2, setHash2] = useState<string | null>(null);
    const [isHashing, setIsHashing] = useState(false);
    const [hashingProgress, setHashingProgress] = useState(0);

    // State for mining simulation
    const [mineableData, setMineableData] = useState<string>('Simulated Block Data');
    const [difficulty, setDifficulty] = useState<number>(4);
    const [walletAddress, setWalletAddress] = useState<string>('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    const [isMining, setIsMining] = useState(false);
    const [miningLog, setMiningLog] = useState<string[]>([]);
    const [foundNonce, setFoundNonce] = useState<number | null>(null);
    const [foundHash, setFoundHash] = useState<string | null>(null);
    const [hashRate, setHashRate] = useState<string>('0.00 H/s');

    const miningRef = useRef(isMining);
    miningRef.current = isMining;
    
    const logContainerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [miningLog]);

    const calculateHashes = useCallback(async (data: string) => {
        if (!data) {
            setHash1(null);
            setHash2(null);
            setHashingProgress(0);
            return;
        }
        setIsHashing(true);
        setHash1(null);
        setHash2(null);

        setHashingProgress(1); // Start pass 1
        
        // Yield to the event loop to allow UI to update for the first pass
        await new Promise(resolve => setTimeout(resolve, 0));

        const encoder = new TextEncoder();
        const dataUint8 = encoder.encode(data);
        const firstHashBuffer = await crypto.subtle.digest('SHA-256', dataUint8);
        setHash1(bufferToHex(firstHashBuffer));
        
        setHashingProgress(2); // Start pass 2
        await new Promise(resolve => setTimeout(resolve, 0));

        const secondHashBuffer = await crypto.subtle.digest('SHA-256', firstHashBuffer);
        setHash2(bufferToHex(secondHashBuffer));
        
        // Let the 100% bar be visible for a moment before disappearing
        await new Promise(resolve => setTimeout(resolve, 400));
        setIsHashing(false);
        setHashingProgress(0);
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            calculateHashes(inputData);
        }, 300); // Debounce input
        return () => clearTimeout(handler);
    }, [inputData, calculateHashes]);
    
    const startMining = useCallback(async () => {
        setIsMining(true);
        setFoundNonce(null);
        setFoundHash(null);
        setMiningLog([]);
        setHashRate('Calculating...');
        
        const target = '0'.repeat(difficulty);
        
        const mine = async () => {
            let nonce = 0;
            let lastNonce = 0;
            let lastUpdateTime = performance.now();
            const UPDATE_INTERVAL_MS = 2000;

            while (miningRef.current) {
                const dataToHash = mineableData + nonce;
                const hash = await doubleSha256(dataToHash);

                if (hash.startsWith(target)) {
                    setFoundNonce(nonce);
                    setFoundHash(hash);
                    setMiningLog(prev => [...prev, `Success! Found nonce: ${nonce}`, `Final Hash: ${hash}`]);
                    setIsMining(false);
                    setHashRate('0.00 H/s');
                    return;
                }
                
                const now = performance.now();
                if (now - lastUpdateTime > UPDATE_INTERVAL_MS) {
                    const hashes = nonce - lastNonce;
                    const timeSeconds = (now - lastUpdateTime) / 1000;
                    const rate = hashes / timeSeconds;
                    const formattedRate = formatHashRate(rate);

                    setHashRate(formattedRate);
                    setMiningLog(prev => [...prev.slice(-10), `[~${formattedRate}] Attempt ${nonce}: ${hash}`]);

                    lastUpdateTime = now;
                    lastNonce = nonce;
                }
                
                nonce++;
                
                if(nonce % 500 === 0) { // Yield less often for better performance
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
             setHashRate('0.00 H/s'); // Reset on manual stop
        };

        mine();

    }, [difficulty, mineableData]);

    const stopMining = () => {
        setIsMining(false);
        setMiningLog(prev => [...prev, 'Mining process stopped by user.']);
        setHashRate('0.00 H/s');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-3">
                         <MiningIcon className="w-10 h-10 text-amber-400"/>
                        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                            Bitcoin Hash Simulator
                        </h1>
                    </div>
                    <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
                        Explore the core cryptographic function of Bitcoin. Enter any data to see its double SHA-256 hash, and simulate the Proof-of-Work mining process by finding a hash with a specific difficulty.
                    </p>
                </header>

                <main className="grid md:grid-cols-2 gap-8">
                    {/* Basic Hasher Card */}
                    <div className="bg-slate-800/50 p-6 rounded-xl shadow-2xl border border-slate-700">
                        <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Double SHA-256 Hasher</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="input-data" className="block text-sm font-medium text-slate-300 mb-1">Input Data</label>
                                <textarea
                                    id="input-data"
                                    value={inputData}
                                    onChange={(e) => setInputData(e.target.value)}
                                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all font-mono disabled:opacity-50"
                                    rows={3}
                                    disabled={isHashing}
                                />
                            </div>
                            <HashingProgressBar progress={hashingProgress} />
                            <HashDisplay title="SHA-256 (First Pass)" hash={hash1} />
                            <HashDisplay title="Bitcoin Hash (Double SHA-256)" hash={hash2} bgColorClass="bg-slate-700"/>
                        </div>
                    </div>

                    {/* Mining Simulator Card */}
                    <div className="bg-slate-800/50 p-6 rounded-xl shadow-2xl border border-slate-700 flex flex-col">
                        <h2 className="text-2xl font-semibold mb-4 text-amber-300">Proof-of-Work Simulator</h2>
                        <div className="space-y-4 flex-grow flex flex-col">
                           <div>
                                <label htmlFor="mineable-data" className="block text-sm font-medium text-slate-300 mb-1">Block Data</label>
                                <input
                                    type="text"
                                    id="mineable-data"
                                    value={mineableData}
                                    onChange={e => setMineableData(e.target.value)}
                                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="difficulty" className="block text-sm font-medium text-slate-300 mb-1">Difficulty (Leading Zeros)</label>
                                    <input
                                        type="number"
                                        id="difficulty"
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(Math.max(1, Math.min(8, parseInt(e.target.value, 10) || 1)))}
                                        className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                                        min="1"
                                        max="8"
                                    />
                                </div>
                                <div>
                                  <label htmlFor="wallet" className="block text-sm font-medium text-slate-300 mb-1">Reward Address</label>
                                  <input
                                      type="text"
                                      id="wallet"
                                      value={walletAddress}
                                      onChange={e => setWalletAddress(e.target.value)}
                                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all text-xs"
                                  />
                                </div>
                            </div>
                             <div className="flex space-x-4">
                                <button
                                    onClick={startMining}
                                    disabled={isMining}
                                    className="w-full flex items-center justify-center py-2 px-4 bg-amber-500 text-slate-900 font-bold rounded-md hover:bg-amber-400 transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
                                >
                                    {isMining && <Spinner className="w-5 h-5 mr-2"/>}
                                    {isMining ? 'Mining...' : 'Start Mining'}
                                </button>
                                <button
                                    onClick={stopMining}
                                    disabled={!isMining}
                                    className="w-full py-2 px-4 bg-slate-600 text-white font-bold rounded-md hover:bg-slate-500 transition-all duration-200 disabled:bg-slate-700 disabled:cursor-not-allowed"
                                >
                                    Stop
                                </button>
                            </div>

                            <div className="text-center my-3 p-2 bg-slate-900/70 rounded-lg">
                                <p className="text-xs font-medium tracking-wider uppercase text-slate-400">Hash Rate</p>
                                <p className="font-mono text-2xl text-amber-300 transition-all">{hashRate}</p>
                            </div>

                            <div ref={logContainerRef} className="flex-grow bg-slate-900 p-3 rounded-md font-mono text-xs text-slate-400 overflow-y-auto h-32 border border-slate-700">
                                {miningLog.length > 0 ? miningLog.map((log, i) => (
                                    <p key={i} className={`${log.startsWith('Success') ? 'text-green-400' : ''} ${log.startsWith('Final') ? 'text-yellow-300' : ''}`}>{log}</p>
                                )) : <p>Waiting to start mining...</p>}
                            </div>
                            
                            {foundHash && (
                                <div className="mt-4 p-4 bg-green-900/50 border border-green-700 rounded-lg">
                                    <h3 className="font-bold text-lg text-green-300">Block Found!</h3>
                                    <p className="text-sm text-slate-300">Nonce: <span className="font-mono text-white">{foundNonce}</span></p>
                                    <HashDisplay title="Winning Hash" hash={foundHash} bgColorClass="bg-green-800/50" />
                                </div>
                            )}

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
