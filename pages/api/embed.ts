// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const API_KEY = process.env.NEXT_PUBLIC_OPENAI_KEY;
  const apiUrl = "https://api.openai.com/v1/embeddings";

  const text = req.body.text;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-ada-002"
    }),
  });

  const data = await response.json();
  const embedding = data['data'][0]['embedding']

  return res.status(200).json({ embedding });
}

