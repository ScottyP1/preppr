import Image from 'next/image'

export default function About() {
  const imgtxt1 = "In Ethiopia, families gather around a single platter of injera, tearing pieces by hand and sharing bites together. The act of eating from one plate isn’t just tradition—it’s a symbol of unity and trust."
  const imgtxt2 = "In India, the Sikh tradition of langar feeds millions every day. Volunteers prepare and serve free meals for anyone who enters, making food a living expression of generosity and equality."
  const imgtxt3 = "In small Italian towns, neighbors still gather for pasta-making days. Dough is kneaded and rolled side by side, then shared in long feasts that celebrate both craft and community."
  const imgtxt4 = "In Mexico, kitchens open their doors with tamales and tacos made for friends, neighbors, and passersby. Cooking becomes a way to connect, not just to feed."

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 text-gray-800">
      <header className="w-full max-w-6xl text-center mb-8 bg-white/30 p-2 rounded-md">
        <h1 className="text-2xl sm:text-3xl font-semibold pb-1">Preppr Food Stories</h1>
        <h3 className="text-lg sm:text-xl">At Preppr, we believe that food has always been about more than nourishment—it’s about people. 
            Preppr carries this spirit forward, creating a place where cooking strengthens community, supports local jobs, 
            and turns every meal into something shared.</h3>
      </header>

      <section className="w-full max-w-6xl grid gap-8">
        {/* Row 1: Image left (md+), text right */}
        <article className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="order-1 md:order-1">
            <Image
              src="/About1.png"
              alt="Image 1"
              width={800}
              height={500}
              className="w-full h-auto rounded-md object-cover"
            />
          </div>
          <div className="order-2 md:order-2 bg-white/30 p-2 rounded-md">
            <h3 className="text-xl sm:text-2xl font-semibold pb-2 text-center">Ethiopia</h3>
            <p className="text-lg sm:text-xl leading-7 text-gray-700">{imgtxt1}</p>
          </div>
        </article>

        {/* Row 2: Image right (md+), text left */}
        <article className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="order-1 md:order-2">
            <Image
              src="/About2.png"
              alt="Image 2"
              width={800}
              height={500}
              className="w-full h-auto rounded-md object-cover"
            />
          </div>
          <div className="order-2 md:order-1 bg-white/30 p-2 rounded-md">
            <h3 className="text-xl sm:text-2xl font-semibold pb-2 text-center">India</h3>
            <p className="text-lg sm:text-xl leading-7 text-gray-700">{imgtxt2}</p>
          </div>
        </article>

        {/* Row 3: Image left (md+), text right */}
        <article className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="order-1 md:order-1">
            <Image
              src="/About3.png"
              alt="Image 3"
              width={800}
              height={500}
              className="w-full h-auto rounded-md object-cover"
            />
          </div>
          <div className="order-2 md:order-2 bg-white/30 p-2 rounded-md">
            <h3 className="text-xl sm:text-2xl font-semibold pb-2 text-center">Italy</h3>
            <p className="text-lg sm:text-xl leading-7 text-gray-700">{imgtxt3}</p>
          </div>
        </article>

        {/* Row 4: Image right (md+), text left */}
        <article className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="order-1 md:order-2">
            <Image
              src="/About4.png"
              alt="Image 4"
              width={800}
              height={500}
              className="w-full h-auto rounded-md object-cover"
            />
          </div>
          <div className="order-2 md:order-1 bg-white/30 p-2 rounded-md">
            <h3 className="text-xl sm:text-2xl font-semibold pb-2 text-center">Mexico</h3>
            <p className="text-lg sm:text-xl leading-7 text-gray-700">{imgtxt4}</p>
          </div>
        </article>
      </section>

      {/* Footer now provided globally via layout */}
    </main>
  )
}
