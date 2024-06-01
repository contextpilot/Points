// Import the FontAwesomeIcon component
import Typewriter from 'typewriter-effect';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useContractRead } from "wagmi";
import { useState, useEffect } from "react";
import { ethers } from 'ethers';

ChartJS.register(ArcElement, Tooltip, Legend);


async function myContractReadFunction(participantAddress, PRESALE_ID) {
    // Ensure window.ethereum is available
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Create a new provider using window.ethereum
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            // Create a new instance of a Contract using the provided ABI, address, and your signer
            const contractABI = JSON.parse(process.env.NEXT_PUBLIC_CONTRACT_ABI); // Assuming ABI is stored as a JSON string
            const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS.toString();
            const contract = new ethers.Contract(contractAddress, contractABI, provider);

            // Call the contract's function and pass in the necessary arguments
            const vestingData = await contract.userVesting(participantAddress, PRESALE_ID);

            // Process the return values if needed
            const formattedData = {
                address: participantAddress,
                totalAmount: vestingData.totalAmount.toString(),
                claimedAmount: vestingData.claimedAmount.toString()
            };

            return formattedData;
        } catch (error) {
            console.error('Could not get vesting data:', error);
            // Handle errors, e.g., user rejected the transaction, etc.
            return null;
        }
    } else {
        // Window.ethereum is not found
        alert('Please install MetaMask or another Ethereum-compatible browser extension.');
        return null;
    }
}


function useLeaderboardData(CONTRACT_ADDRESS, CONTRACT_ABI, PRESALE_ID) {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const { data: participantsData, isError, isFetching } = useContractRead({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS.toString(),
        abi: process.env.NEXT_PUBLIC_CONTRACT_ABI,
        functionName: 'getPresaleParticipants',
        args: [PRESALE_ID],
        watch: true,
    });

    useEffect(() => {
        // This will only run once the participantsData is fetched
        async function fetchData() {
            if (participantsData && !isError && !isFetching) {
                const promises = participantsData.map(async (participantAddress) => {
                    // using a regular function call here instead of a hook
                    return await myContractReadFunction(participantAddress, PRESALE_ID);
                    //console.log(participantAddress);
                });

                Promise.all(promises).then(results => {
                    const sortedData = results.sort((a, b) => b.totalAmount - a.totalAmount);
                    setLeaderboardData(sortedData);
                });
            }
        }

        fetchData().catch(console.error);
    }, [participantsData, isError, isFetching]);



    return leaderboardData;
}

const abbreviateAddress = (address) => {
    return `${address.substring(0, 6)}…${address.substring(address.length - 4)}`;
}

const ITEMS_PER_PAGE = 5;

export default function Section7() {
    // You can replace these with actual contract address and ABI as per your setup
    const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS.toString();
    const CONTRACT_ABI = process.env.NEXT_PUBLIC_CONTRACT_ABI;
    const PRESALE_ID = process.env.NEXT_PUBLIC_PRESALE_ID;

    const leaderboardData = useLeaderboardData(CONTRACT_ADDRESS, CONTRACT_ABI, PRESALE_ID);

    // State to keep track of the current page
    const [currentPage, setCurrentPage] = useState(0);

    // Calculate the number of pages
    const totalPages = Math.ceil(leaderboardData.length / ITEMS_PER_PAGE);

    // Compute the leaderboard data for the current page
    const paginatedData = leaderboardData.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    // Function to change page
    const setPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };


    return (
        <>
            <section id="section7" className="flex items-center justify-around min-h-screen h-fit bg-fixed bg-center bg-cover bg-[url('/images/bg/23.jpg')]">
                <div className="text-center">
                    <div className="box-cont h-fit w-fit px-14 mb-10 py-8 shadow-md bg-gradient-to-r from-neutral-900 rounded-lg">
                        <h4 className="lead text-white font-bold mb-10">
                            <Typewriter
                                options={{
                                    strings: ["Leader Board"],
                                    autoStart: true,
                                    loop: true,
                                    pauseFor: 600000
                                }}
                            />
                        </h4>
                        <div className="tokenomicsDiv" style={{ height: '100%', minHeight: 'calc(5 * 4rem)' }}>
                            <table className="table-auto w-full text-white border-separate" style={{ borderSpacing: 0, height: '100%' }}>
                                <thead>
                                    <tr className="bg-gray-800">
                                        <th className="border border-white p-4">Rank</th>
                                        <th className="border border-white p-4">Address</th>
                                        <th className="border border-white p-4">Total Amount</th>
                                        <th className="border border-white p-4">Claimed Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((entry, index) => (
                                        <tr key={entry.address} className="text-center">
                                            <td className="border border-white p-4">{index + 1 + ITEMS_PER_PAGE * currentPage}</td>
                                            <td className="border border-white p-4">{abbreviateAddress(entry.address)}</td>
                                            <td className="border border-white p-4">{entry.totalAmount}</td>
                                            <td className="border border-white p-4">{entry.claimedAmount}</td>
                                        </tr>
                                    ))}
                                    {/* Add empty rows if necessary to maintain consistent table height */}
                                    {Array.from({ length: ITEMS_PER_PAGE - paginatedData.length }, (_, index) => (
                                        <tr key={`empty-${index}`} className="text-center">
                                            <td className="border border-white p-4">&nbsp;</td>
                                            <td className="border border-white p-4">&nbsp;</td>
                                            <td className="border border-white p-4">&nbsp;</td>
                                            <td className="border border-white p-4">&nbsp;</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="flex justify-center mb-4">
                        <div className="flex rounded-md">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setPage(index)}
                                    className={`px-4 py-2 mx-1 ${currentPage === index
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-300 text-black"
                                        } rounded-md focus:outline-none`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}