import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";

// Homepage Home Section
export default function HomeSection() {
    return (
        <>
            {/* PARALLAX ONE START */}
            <section
                id="home"
                className="flex flex-col items-center justify-center min-h-screen bg-fixed bg-center bg-cover bg-[url('/images/bg/23.jpg')]"
            >
                <div className="container mx-auto text-center mt-20 md:mt-0 p-4 sm:p-6 md:p-8">
                    <h2 className="uppercase text-lg md:text-2xl text-white font-bold">
                        Context Pilot
                    </h2>

                    <p className="text-white">
                        <strong>✓</strong> Organize context easily <strong>✓</strong> Make
                        change quickly <strong>✓</strong> Pay as you use <strong>✓</strong> AI
                        assistance.
                    </p>
                    <br />
                    <div className="flex justify-center items-center">
                        <div className="video-responsive w-full max-w-md md:max-w-lg">
                            <iframe
                                width="100%"
                                height="315"
                                src="https://www.youtube.com/embed/MbSJaAMSErU"
                                frameBorder="0"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="YouTube Video"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
