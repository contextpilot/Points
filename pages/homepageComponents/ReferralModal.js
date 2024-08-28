import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

export default function ReferralModal({ referredCreditScores, referredBonuses, idmap, onClose, toAddress }) {
    const [selectedRefs, setSelectedRefs] = useState([]);
    const [responseMessage, setResponseMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckboxChange = (address) => {
        if (selectedRefs.includes(idmap[address])) {
            setSelectedRefs(selectedRefs.filter(id => id !== idmap[address]));
        } else {
            setSelectedRefs([...selectedRefs, idmap[address]]);
        }
    };

    const abbreviateAddress = (address) => {
        // Abbreviate the address to show the first and last 5 characters
        return `${address.slice(0, 5)}...${address.slice(-5)}`;
    };

    const calculateTotalBonuses = () => {
        return selectedRefs.reduce((total, id) => {
            const address = Object.keys(idmap).find(key => idmap[key] === id);
            return total + (referredBonuses[address] || 0);
        }, 0);
    };

    const totalBonuses = useMemo(calculateTotalBonuses, [selectedRefs]);

    const handleAirdrop = async () => {
        setIsLoading(true);
        const referAddresses = selectedRefs.map(id => {
            const address = Object.keys(idmap).find(key => idmap[key] === id);
            return address;
        });

        const payload = {
            to_address: toAddress,
            refer_addresses: referAddresses
        };

        try {
            const response = await fetch('https://main-wjaxre4ena-uc.a.run.app/gairdrop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                // Handle success
                setResponseMessage(
                    <span>
                        Successful! Transaction Hash: 
                        <a 
                            href={data.transaction_hash} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-500 underline ml-2"
                        >
                            link
                        </a>
                    </span>
                );
            } else {
                // Handle errors
                setResponseMessage(`Airdrop failed! Error: ${data.error}`);
            }
        } catch (error) {
            setResponseMessage(`Airdrop request error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-black opacity-50 absolute inset-0"></div>
            <div className="relative z-10 bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl mb-4">Referred Accounts</h2>
                <table className="w-full mb-4">
                    <thead>
                        <tr>
                            <th className="border p-2">Account</th>
                            <th className="border p-2">Credit Score</th>
                            <th className="border p-2">Bonus</th>
                            <th className="border p-2">Select</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(referredCreditScores).map(([address, score]) => (
                            <tr key={address}>
                                <td className="border p-2">{abbreviateAddress(address)}</td>
                                <td className="border p-2">{score.toFixed(2)}</td>
                                <td className="border p-2">{referredBonuses[address] ? referredBonuses[address] : 'N/A'}</td>
                                <td className="border p-2 text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedRefs.includes(idmap[address])}
                                        onChange={() => handleCheckboxChange(address)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4">
                    <p>Selected Bonuses: {totalBonuses}</p>
                    {totalBonuses > 0 && (
                        <button
                            onClick={handleAirdrop}
                            className="bg-green-500 text-white px-4 py-2 rounded ml-4"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : 'Get Bonus'}
                        </button>
                    )}
                    {responseMessage && (
                        <div className="mt-4 p-2 bg-gray-200 rounded">
                            <p>{responseMessage}</p>
                        </div>
                    )}
                </div>
                <a 
                    href="https://doc.context-pilot.xyz/getting-started/referral-bonus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline mt-4 block"
                >
                    Learn more about referral bonuses
                </a>
                <button onClick={onClose} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">Close</button>
            </div>
        </div>
    );
}

ReferralModal.defaultProps = {
    referredCreditScores: {},
    referredBonuses: {},
    idmap: {}
};

ReferralModal.propTypes = {
    referredCreditScores: PropTypes.object.isRequired,
    referredBonuses: PropTypes.object.isRequired,
    idmap: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    toAddress: PropTypes.string.isRequired,
};