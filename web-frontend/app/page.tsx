// "use client";

// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
// import { ArrowRight, ShieldCheck, Zap, Database } from "lucide-react";

// export default function LandingPage() {
//   return (
//     <div className="min-h-screen flex flex-col">
//       <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
//         <div className="text-xl font-bold tracking-tighter">Truth Intelligence</div>
//         <div className="flex items-center space-x-4">
//           <Show when="signed-out">
//             <SignInButton mode="modal">
//               <Button variant="ghost">Log in</Button>
//             </SignInButton>
//             <SignUpButton mode="modal">
//               <Button>Get Started</Button>
//             </SignUpButton>
//           </Show>

//           <Show when="signed-in">
//             <UserButton />
//             <Link href="/dashboard">
//               <Button variant="outline">Go to Dashboard</Button>
//             </Link>
//           </Show>
//         </div>
//       </nav>

//       <main className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-20">
//         <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground mb-6">
//           Smart India Hackathon - Phase 1
//         </div>
//         <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6">
//           Automated <span className="text-blue-600">Fake News</span> Detection Engine
//         </h1>
//         <p className="text-xl text-muted-foreground max-w-2xl mb-10">
//           A robust application designed to combat misinformation by extracting claims and retrieving live web evidence using RAG.
//         </p>

//         <div className="flex items-center space-x-4">
//           <Show when="signed-out">
//             <SignUpButton mode="modal">
//               <Button size="lg" className="h-12 px-8 text-lg">
//                 Create Account <ArrowRight className="ml-2 h-5 w-5" />
//               </Button>
//             </SignUpButton>
//           </Show>

//           <Show when="signed-in">
//             <Link href="/dashboard">
//               <Button size="lg" className="h-12 px-8 text-lg">
//                 Enter Intelligence Node <ArrowRight className="ml-2 h-5 w-5" />
//               </Button>
//             </Link>
//           </Show>
//         </div>
//       </main>
//     </div>
//   );
// }
// "use client";

// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { ClerkLoading, Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
// import { ArrowRight } from "lucide-react";
// import WobblyLoader from "@/components/WobblyLoader";

// export default function LandingPage() {
//   return (
//     <>
//       <ClerkLoading>
//         <WobblyLoader />
//       </ClerkLoading>

//       <div className="min-h-screen flex flex-col">
//         <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
//           <div className="text-xl font-bold tracking-tighter">Truth Intelligence</div>
//           <div className="flex items-center space-x-4">
//             <Show when="signed-out">
//               <SignInButton mode="modal">
//                 <Button variant="ghost">Log in</Button>
//               </SignInButton>
//               <SignUpButton mode="modal">
//                 <Button>Get Started</Button>
//               </SignUpButton>
//             </Show>

//             <Show when="signed-in">
//               <UserButton />
//               <Link href="/dashboard">
//                 <Button variant="outline">Go to Dashboard</Button>
//               </Link>
//             </Show>
//           </div>
//         </nav>

//         <main className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-20">
//           <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground mb-6">
//             Smart India Hackathon - Phase 1
//           </div>
//           <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6">
//             Automated <span className="text-blue-600">Fake News</span> Detection Engine
//           </h1>
//           <p className="text-xl text-muted-foreground max-w-2xl mb-10">
//             A robust application designed to combat misinformation by extracting claims and retrieving live web evidence using RAG.
//           </p>

//           <div className="flex items-center space-x-4">
//             <Show when="signed-out">
//               <SignUpButton mode="modal">
//                 <Button size="lg" className="h-12 px-8 text-lg">
//                   Create Account <ArrowRight className="ml-2 h-5 w-5" />
//                 </Button>
//               </SignUpButton>
//             </Show>

//             <Show when="signed-in">
//               <Link href="/dashboard">
//                 <Button size="lg" className="h-12 px-8 text-lg">
//                   Enter Intelligence Node <ArrowRight className="ml-2 h-5 w-5" />
//                 </Button>
//               </Link>
//             </Show>
//           </div>
//         </main>
//       </div>
//     </>
//   );
// }
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ArrowRight, ShieldCheck, Zap, Database } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="text-xl font-bold tracking-tighter">Truth Intelligence</div>
        <div className="flex items-center space-x-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost">Log in</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button>Get Started</Button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <UserButton />
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </Show>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-20">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground mb-6">
          Smart India Hackathon Phase 1
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6">
          Automated <span className="text-blue-600">Fake News</span> Detection Engine
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10">
          A robust application designed to combat misinformation by extracting claims and retrieving live web evidence using RAG.
        </p>

        <div className="flex items-center space-x-4">
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <Button size="lg" className="h-12 px-8 text-lg">
                Create Account <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 text-lg">
                Enter Intelligence Node <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </Show>
        </div>
      </main>
    </div>
  );
}