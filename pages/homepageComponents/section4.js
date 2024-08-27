import SeedSale from "./seedSale.js";

export default function Section4({ slug }) {
    return (
        <>
            <section id="section4" className="flex place-items-center justify-around min-h-screen h-fit bg-fixed bg-center bg-cover bg-[url('/images/bg/20.jpg')]">
                <div className="grid grid-flow-row auto-rows-min sm:grid-flow-col justify-around">
                    <SeedSale slug={slug} />
                </div>
            </section>
        </>
    )
}