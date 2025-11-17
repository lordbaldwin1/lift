import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-[calc(90vh-8rem)] flex flex-col items-center justify-center bg-whtie">
        <h1 className="whitespace-pre text-3xl">{`Oops, this page doesn't exist.`}</h1>
        <div className="mt-4 flex justify-center">
          <Link
            className="hover:text-muted-foreground transition-all duration-200 flex flex-row items-center group"
            href={"/"}
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 translate-all duration-200" />{`click here to go back`}
          </Link>
      </div>
    </div>
  );
}