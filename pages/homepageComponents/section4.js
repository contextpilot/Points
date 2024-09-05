import SeedSale from "./seedSale.js";
import Footer from "./footer.js"; // Import the Footer component

export default function Section4({ slug }) {
    return (
        <>
            <section id="section4" className="flex flex-col place-items-center justify-around min-h-screen h-fit bg-fixed bg-center bg-cover bg-[url('/images/bg/20.jpg')]">
                <div className="grid grid-flow-row auto-rows-min sm:grid-flow-col justify-around w-full">
                    <SeedSale slug={slug} />
                </div>
                <Footer /> {/* Embed the Footer component here */}
            </section>
        </>
    );
}