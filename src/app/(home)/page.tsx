import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <Image
        src="/background.jpg"
        alt="Background"
        fill
        quality={100}
        priority
        className="object-cover object-center"
      />
      <div className="relative z-10">
        {/* Your content here */}
      </div>
    </main>
  );
}