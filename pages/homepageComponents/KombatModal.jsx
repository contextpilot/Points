import React from 'react';

export default function KombatModal({ isOpen, onClose, telegram_code }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black opacity-50 absolute inset-0"></div>
            <div className="bg-white rounded-lg p-4 z-10 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Launch Kombat</h2>
                <div className="space-y-4">
                    <a href={`https://kombat.context-pilot.xyz/${telegram_code}`} target="_blank" rel="noopener noreferrer" className="w-full inline-block text-center bg-blue-500 text-white px-4 py-2 rounded">
                        Launch in Web
                    </a>
                    <a href="https://t.me/PilotKombatBot" target="_blank" rel="noopener noreferrer" className="w-full inline-block text-center bg-green-500 text-white px-4 py-2 rounded">
                        Launch in Telegram (2X Points!)
                    </a>
                </div>
                <button onClick={onClose} className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded">
                    Close
                </button>
            </div>
        </div>
    );
}