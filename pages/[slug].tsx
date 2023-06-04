import { useRouter } from "next/router";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { useEffect, useState } from "react";
import { JetBrains_Mono } from "next/font/google";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import Head from 'next/head';

const jbm = JetBrains_Mono({ subsets: ["latin"] });

export default function DynamicPage() {
    const router = useRouter();
    const { slug } = router.query; // Access the dynamic parameter value

    const [entries, setEntries]: any = useState([]);
    const [entry, setEntry]: any = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [buttonPress, setButtonPress] = useState(false);

    useEffect(() => {
    const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID;
    const doc = new GoogleSpreadsheet(SHEET_ID);
    // If env variables are not set, do not load
    if (
        !SHEET_ID ||
        !process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL ||
        !process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY
    ) {
        setError(true);
        return;
    }
    doc.useServiceAccountAuth({
        client_email: process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY.replace(
        /\\n/gm,
        "\n"
        ),
    });
    doc
        .loadInfo()
        .then(() => {
        const sheet = doc.sheetsByIndex[0];
        sheet.getRows().then((rows) => {
            setEntries(rows.reverse());
            setLoading(false);
        });
        })
        .catch((e) => {
        console.log(e);
        setError(true);
        });
    }, []);

    // If the slug matches any entry's UID, set the entry
    useEffect(() => {
        if (entries.length > 0) {
            const entry = entries.find((entry: any) => entry.UID === slug);
            setEntry(entry);
        }
    }, [entries, slug]);

    if (loading) {
        return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p className={`text-4xl ${jbm.className}`}>Loading...</p>
        </div>
        );
    }

    if (error) {
        return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p className={`text-4xl ${jbm.className}`}>Error loading entries</p>
        </div>
        );
    }

    if (!entry) {
        return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <p className={`text-4xl ${jbm.className} pb-4`}>Entry not found</p>
            <Link href="/" className={`${jbm.className} text-blue-500`}>Back to Home</Link>
        </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-10 md:p-64">
        <Head>
            <meta property="og:title" content={entry.Entry} />
            <meta property="og:description" content={entry.Entry} />
        </Head>
        <p className={`text-sm ${jbm.className} text-gray-400 pb-2`}>{
            // Display date and time in a readable format, use zero padding
            // All dates should be the same length
            new Date(entry.Time).toLocaleString("en-US", {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          }</p>
        <p className={`${jbm.className} pb-4`}><ReactMarkdown>{entry.Entry}</ReactMarkdown></p>
        <button
            className={`text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center ${jbm.className} mb-4`}
            onClick={() => {
                // Write URL
            navigator.clipboard.writeText(window.location.href);
            setButtonPress(true);
        }}>
            <CopySVG />
            Copy
        </button>
        <Link href="/" className={`${jbm.className} text-blue-500`}>Back to Home</Link>
        {/* On button press, display toast for 1 second */}
        {buttonPress && (
            <Toast message="URL copied to clipboard!" duration={800} setFalse={setButtonPress} />
        )}
        </div>
    );
}

function Toast({ message, duration, setFalse }: any) {
    // Set a timer to hide the toast
    useEffect(() => {
        const timer = setTimeout(() => {
        setFalse(false);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration]);

    return (
        <div
        className={`text-sm fixed bottom-10 ml-4 mb-4 p-2 bg-green-600 text-white rounded-md ${jbm.className} animate-pulse`}
        style={{ zIndex: 50 }}
        >
        {message}
        </div>
    );
}

function CopySVG() {
    return (
        <svg
        className="fill-current w-4 h-4 mr-2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        >
        <path
            d="M19,21H5a2,2,0,0,1-2-2V9A2,2,0,0,1,5,7H7V5A2,2,0,0,1,9,3h6a2,2,0,0,1,2,2v2h2a2,2,0,0,1,2,2v8A2,2,0,0,1,19,21ZM9,5V7h6V5Zm6,14V13H9v6Z"
        />
        </svg>
    )
}