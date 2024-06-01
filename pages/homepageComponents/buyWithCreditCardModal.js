// BuyWithCreditCardModal.jsx
import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import Modal from './modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';

export default function BuyWithCreditCardModal() {
    const [isLoading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const stripe = useStripe();
    const elements = useElements();

    async function handlePayment() {
        setLoading(true);

        if (!stripe || !elements) {
            console.error('Stripe.js has not been loaded yet!');
            setLoading(false);
            return;
        }

        const cardElement = elements.getElement(CardElement);
        const paymentMethodResult = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (paymentMethodResult.error) {
            console.error(paymentMethodResult.error.message);
            setLoading(false);
            return;
        }

        // TODO You would usually send 'paymentMethodResult.paymentMethod.id' to your server here and perform charges

        setLoading(false);
        console.log('Purchase was successful!');
        setShowModal(false); // Close the modal
    }

    // New function to handle the initial button click
    function handleButtonClick() {
        // TODO integrate with your own payment page
        //if (!stripe) {
            // Define dimensions and position for the popup window
            const width = 800;
            const height = 600;
            const left = (window.innerWidth - width) / 2;
            const top = (window.innerHeight - height) / 2;

            // Popup window features
            const features = [
                `width=${width}`,
                `height=${height}`,
                `top=${top}`,
                `left=${left}`,
                'status=no',
                'menubar=no',
                'toolbar=no',
                'location=no',
                'resizable=yes',
                'scrollbars=yes'
            ].join(',');

            // Opens the URL in a popup window
            window.open('https://buy.stripe.com/test_aEUeXQ7UD7JU63e4gg', 'stripePopup', features);
        //}
        //else {
        //    setShowModal(true);
        //}

    }

    return (
        <>
            <button
                className="bg-blue-600 text-white hover:text-white hover:bg-slate-300 active:bg-blue-900 font-bold uppercase text-base px-8 py-3 rounded-[24px] shadow-md hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={handleButtonClick} // Use the new click handler here
            >
                Buy with Credit Card <FontAwesomeIcon icon={faCreditCard} className="ml-2" />
            </button>
            {showModal ? (
                <>
                    <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                        <div className="p-6 bg-white rounded-md">
                            <h3 className="text-lg font-semibold mb-4">Enter Payment Details</h3>
                            <div className="mb-4">
                                <CardElement options={{
                                    style: {
                                        base: {
                                            fontSize: '16px',
                                        },
                                    },
                                }} />
                            </div>
                            <button
                                disabled={!stripe || isLoading}
                                className={`bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={handlePayment}
                            >
                                {isLoading ? 'Processing...' : 'Pay with Credit Card'}
                            </button>
                        </div>
                    </Modal>
                </>
            ) : null}
        </>
    );
}
