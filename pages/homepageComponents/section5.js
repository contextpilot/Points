// Import the FontAwesomeIcon component
import { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
faCircleDown, faSpinner
} from "@fortawesome/free-solid-svg-icons";
import Typewriter from 'typewriter-effect';
import axios from 'axios';


// Homepage Section2 Section
export default function Section5() {
    const [isLoading, setLoading] = useState(false);


    const postDataToAPI = async (apiEndpoint, headers, body) => {
        axios.defaults.baseURL = 'https://main-wjaxre4ena-uc.a.run.app/';
        const messageJsonString = JSON.stringify(body);
        return axios.post(apiEndpoint, { message_json: messageJsonString }, {
            headers: headers
        });
    };

    const handleAddressSubmission = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        // Set to loading state
        setLoading(true);

        // Construct the request body
        const requestBody = {
            message_json: {
                street: formData.get('street'),
                street2: formData.get('street2'),
                city: formData.get('city'),
                state: formData.get('state'),
                postalCode: formData.get('postalCode'),
                country: formData.get('country'),
                referralCode: formData.get('referralCode'), // new line for referral code data
            },
            message: [{ role: "system", content: "I am butterflyx" }, { role: "user", content: "hello" }]
        };

        try {
            const response = await postDataToAPI('greenfield', { 'Content-Type': 'application/json' }, requestBody);
            const uri = response.data.uri;
            alert(`Your URI: ${uri}`);
            // Alternatively, redirect to another page or perform another action
        } catch (error) {
            console.error('There was a problem with the axios operation:', error);
            // TODO: Show error to the user appropriately
            alert('Failed to submit address. Please try again.');
        }

        // Reset loading state
        setLoading(false);
    };

    return (
        <>
            <section id="section5" className="flex place-items-center justify-around min-h-screen h-fit bg-fixed bg-center bg-cover bg-[url('/images/bg/21.jpg')]" >
                <div className="text-center">
                    <div className="box-cont h-fit w-fit px-14 mb-10 py-8 shadow-md bg-gradient-to-r from-neutral-900 rounded-lg">
                        <h2 className="text-white font-bold">👨‍🚀 Claim your device</h2>
                        <h4 className="lead text-white font-bold">
                            <Typewriter
                                options={{
                                    strings: ["Enter your details", "To receive device", "And claim NFT"],
                                    autoStart: true,
                                    loop: true,
                                }}
                            />
                        </h4>

                        <form onSubmit={handleAddressSubmission} className="text-white mb-10">
                            <div className="mb-6">
                                <input
                                    type="text"
                                    name="street"
                                    placeholder="Street Address"
                                    required
                                    className="form-input mt-2 block w-full text-black"
                                />
                            </div>
                            <div className="mb-6">
                                <input
                                    type="text"
                                    name="street2"
                                    placeholder="Street Address Line 2"
                                    className="form-input mt-2 block w-full text-black"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="City"
                                    required
                                    className="form-input mt-2 col-span-1 text-black"
                                />
                                <input
                                    type="text"
                                    name="state"
                                    placeholder="State/Province"
                                    className="form-input mt-2 col-span-1 text-black"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <input
                                    type="text"
                                    name="postalCode"
                                    placeholder="Postal Code"
                                    required
                                    className="form-input mt-2 block w-full text-black"
                                />
                                <input
                                    type="text"
                                    name="country"
                                    placeholder="Country"
                                    required
                                    className="form-input mt-2 block w-full text-black"
                                />
                            </div>
                            <div className="mb-6">
                                <input
                                    type="text"
                                    name="referralCode"
                                    placeholder="Referral Code"
                                    className="form-input mt-2 block w-full text-black"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading} // Disable button when loading
                                className="bg-slate-300 text-black hover:bg-red-600 active:bg-red-900 font-bold uppercase text-base px-8 py-3 rounded-[24px] shadow-md hover:shadow-lg outline-none focus:outline-none mb-1 ease-linear transition-all duration-150">
                                {isLoading ? (
                                    <>Loading <FontAwesomeIcon icon={faSpinner} spin className="ml-2" /></>
                                ) : (
                                    <>Submit <FontAwesomeIcon icon={faCircleDown} className="ml-2" /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}