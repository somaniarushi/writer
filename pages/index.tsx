import React, { useState, useEffect } from "react";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JetBrains_Mono } from "next/font/google";
import Typewriter from "typewriter-effect";
import Link from "next/link";
import Head from "next/head";
import ReactMarkdown from "react-markdown";
import { NextSeo } from "next-seo";

const jbm = JetBrains_Mono({ subsets: ["latin"] });

const Header = () => {
  return (
    <NextSeo
      title="The Writer"
      description="A place to write your thoughts"
      canonical="https://writer.amks.me"
      openGraph={{
        url: "https://writer.amks.me",
        title: "The Writer",
        description: "A place to write your thoughts",
      }}
    />
  );
};


export default function Home() {
  // Set type to GoogleSpreadsheetRow[]
  const [entries, setEntries]: any = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchStr, setSearchStr] = useState("");

  useEffect(() => {
    fetch("/api/entries")
      .then((res) => res.json())
      .then((data) => {
        if (data !== undefined) {
          const entries = data['data'].reverse();
          setEntries(entries);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.log(e);
        setError(true);
      });
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Header />
        <p className={`text-4xl ${jbm.className}`}>Error loading entries</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Header />
        <p className={`text-4xl ${jbm.className}`}>Loading...</p>
      </div>
    );
  }

  return (
    <main className={`flex flex-col pt-8 pr-5 md:p-16 ${jbm.className}`}>
      <Header />
      <div className="flex justify-between pb-8">
        <h1 className="text-4xl pl-5 font-bold">
          <Typewriter
            onInit={(typewriter) => {
              typewriter
                .typeString("The Writer")
                .callFunction(() => {
                  console.log("String typed out!");
                })
                .start();
            }}
          />
        </h1>
      </div>
      <div className="flex justify-between pb-8">
        <input
          className="w-full md:w-1/2 p-2 ml-4 rounded-md border-2 border-gray-200 focus:outline-none focus:border-gray-300"
          placeholder="Search"
          onChange={(e) => {
            setSearchStr(e.target.value);
          }}
        />
      </div>
      <div className="flex flex-col justify-between pb-8">
        {entries
          .filter((entry: any) => {
            if (searchStr === "") return true;
            const entryLower = entry['entry'].toLowerCase();
            const searchStrLower = searchStr.toLowerCase();
            return entryLower.includes(searchStrLower);
          })
          .map((entry: any) => (
            <EntryDisplay entry={entry} key={entry['time']} />
          ))}
      </div>
    </main>
  );
}

const EntryDisplay = ({ entry }: any) => {
  // Create space between time and entry
  return (
    <Link href={`/${entry['id']}`}>
      <div
        className="flex flex-col md:flex-row md:items-center pb-8"
        key={entry['time']}
      >
        {/* Make font smaller */}
        <p className="text-sm pr-8 pl-5 text-gray-400 text-2sm">
          {
            // Display date and time in a readable format, use zero padding
            // All dates should be the same length
            new Date(entry['time']).toLocaleString("en-US", {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          }
        </p>
        <p className="pl-5 md:pl-0 md:text-sm md:w-1/2">
          <ReactMarkdown>{entry['entry']}</ReactMarkdown>
        </p>
      </div>
    </Link>
  );
};