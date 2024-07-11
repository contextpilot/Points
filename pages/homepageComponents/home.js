import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";

// Homepage Home Section
export default function HomeSection() {
    return (
        <>
            {/* PARALLAX ONE START */}
            <section id="home" className="flex items-center justify-center h-fit min-h-screen bg-fixed bg-center bg-cover bg-[url('/images/bg/23.jpg')]">
                <div className="container mx-auto text-center mt-[100px] md:mt-0">
                    <h2 className="uppercase lead text-white font-bold">Context Pilot </h2>

                    <p className="text-white"><strong>✓</strong> Organize context easily <strong>✓</strong> Make change quickly
                        <strong>✓</strong> Pay as you use <strong>✓</strong> AI assistance. </p>
                    <br />
                    <div className="flex justify-center items-center">
                        <div className="video-responsive">
                            <iframe
                                width="560"
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
