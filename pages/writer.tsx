import { useState, useEffect } from "react";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { signIn, signOut, useSession } from "next-auth/react"

const inter = JetBrains_Mono({ subsets: ["latin"] });
const pass = process.env.NEXT_PUBLIC_PW;

function Writer() {
  const { data: session } = useSession()

  const submitEvent = async () => {
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID;
    const doc = new GoogleSpreadsheet(SHEET_ID);
    // If env variables are not set, do not load
    if (!SHEET_ID || !process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY) {
        console.log("Error loading entries");
        return;
    }

    await doc.useServiceAccountAuth({
      client_email: process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY.replace(
        /\\n/gm,
        "\n"
      ),
    });

    const embeddingAPICall = await fetch("/api/embed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })

    // const embeddingJson = await embeddingAPICall.json();
    // const embedding = embeddingJson["embedding"];

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const newRow = await sheet.addRow({
      Entry: text,
      Time: new Date().toString(),
      UID: uuidv4(),
      Embedding: "",
    });
    console.log(newRow);
    setText("");
  };

  const [text, setText] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {

    if (session && session.user && session.user.email && session.user.email != process.env.NEXT_PUBLIC_EMAIL) {
      console.log("Cannot submit entries");
      setError(true);
      return;
    } else {
      setError(false);
    }
  }, [session])

  if (!session) {
    return (
      <main
        className={`flex min-h-screen flex-col items-center p-24 ${inter.className}`}
      >
        <GoToReader />
        <div className="flex flex-col">
          <p className="text-center mb-6">Sign in to submit entries</p>
          <button onClick={() => signIn()} className="border-2 border-black text-sm text-center color-black p-2">
            Sign in
          </button>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main
        className={`flex min-h-screen flex-col items-center p-24 ${inter.className}`}
      >
        <GoToReader />
        <p className="text-center mb-6">You are not authorized to submit entries</p>
        <button onClick={() => signOut()} className="border-2 border-black text-sm lg:flex lg:space-x-8 p-2 mb-6">
          Sign out
        </button>
      </main>
    )
  }

  return (
    <main
      className={`flex min-h-screen flex-col items-center p-24 ${inter.className}`}
    >
        <GoToReader />
        <div className="flex flex-col items-center">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border-2 border-black mb-6"
          ></textarea>
        <button onClick={submitEvent} className="border-2 border-black text-sm lg:flex lg:space-x-8 p-2 mb-6">
          Submit
        </button>
        </div>
      <button onClick={() => signOut()} className="z-10 mb-6 border-2 border-black text-sm lg:flex lg:space-x-8 p-2">
        Sign out
      </button>
    </main>
  );
}

function GoToReader() {
  return (
    <Link href="/" className="mb-6 m-0 text-center border-2 p-1 border-black "> Go to Reader </Link>
  )
}

export default Writer;
