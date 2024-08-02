import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCodepen,
    faYoutube,
    faTwitter,
    faGithub
} from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
    return (
        <>
            <footer className="bg-neutral-800 pt-8">
                <div className="py-6 px-4 bg-neutral-900 flex flex-col items-center justify-center text-center">
                    <div className="flex space-x-6">
                        <a href="https://marketplace.visualstudio.com/items?itemName=CryptiTalk.context-pilot" className="text-gray-400 hover:text-white">
                            <FontAwesomeIcon icon={faCodepen} className="mr-2" />
                            <span className="sr-only">VS Code</span>
                        </a>
                        <a href="https://youtu.be/MbSJaAMSErU" className="text-gray-400 hover:text-white">
                            <FontAwesomeIcon icon={faYoutube} className="mr-2" />
                            <span className="sr-only">YouTube channel</span>
                        </a>
                        <a href="https://x.com/PilotContext" className="text-gray-400 hover:text-white">
                            <FontAwesomeIcon icon={faTwitter} className="mr-2" />
                            <span className="sr-only">Twitter page</span>
                        </a>
                        <a href="https://github.com/contextpilot" className="text-gray-400 hover:text-white">
                            <FontAwesomeIcon icon={faGithub} className="mr-2" />
                            <span className="sr-only">Github page</span>
                        </a>
                    </div>
                    <span className="text-sm text-gray-300 mb-4">
                        © 2024 <a href="#">ContextPilot</a>. All Rights Reserved.
                    </span>
                </div>
            </footer>
        </>
    );
}
