import Link from 'next/link';
import Footer from '~/components/footer';
import { Button } from '~/components/ui/button';

export default function HomePage() {
  return (
    <div className="h-[calc(100vh-8rem)] bg-background flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="max-w-3xl mx-auto text-center text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter">
          <h1>lift.</h1>
          <h1>rest.</h1>
          <h1>repeat.</h1>
        </div>
        <div className="flex flex-row gap-4 items-center justify-center mt-12">
          <Link href={"/workout"}>
            <Button className="rounded-full text-xl p-7 tracking-tighter">begin</Button>
          </Link>
          <Link href={"/about"}>
            <Button className="rounded-full text-xl p-7 tracking-tighter" variant={"outline"}>learn</Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}