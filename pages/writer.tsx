import { useState } from "react";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inter } from "next/font/google";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

const inter = Inter({ subsets: ["latin"] });
const pass = process.env.NEXT_PUBLIC_PW;

function Writer() {
  const submitEvent = async () => {
    // If the password is incorrect, do not submit
    if (pw !== pass) {
      console.log("Incorrect password");
      return;
    }
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

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const newRow = await sheet.addRow({
      Entry: text,
      Time: new Date().toString(),
      UID: uuidv4(),
    });
    console.log(newRow);
    setText("");
  };

  const [pw, setPw] = useState("");
  const [text, setText] = useState("");

  return (
    <main
      className={`flex min-h-screen flex-col items-center p-24 ${inter.className}`}
    >
      <Link href="/" className="pb-6 m-0"> Go to Reader </Link>
      <div className="z-10 w-full max-w-5xl font-mono text-sm lg:flex lg:space-x-8">
        {/* Add padding bottom */}
        <div className="flex flex-col items-center justify-between pb-8">
          <label htmlFor="password">Password</label>
          <input
            type="text"
            id="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full border-2 border-black"
          />
        </div>

        <div className="flex flex-col items-center">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border-2 border-black"
          ></textarea>
        <button onClick={submitEvent} className="z-10">
          Submit
        </button>
        </div>
      </div>
    </main>
  );
}

export default Writer;
