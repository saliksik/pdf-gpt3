import type { NextApiRequest, NextApiResponse } from "next"
import { PineconeClient } from "@pinecone-database/pinecone"
import { ChatVectorDBQAChain } from "langchain/chains"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { OpenAI, OpenAIChat } from "langchain/llms"
import { PineconeStore } from "langchain/vectorstores"

const PINECONE_INDEX_NAME = "data-gpt"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { question, chatHistory } = req.body

  const pinecone = new PineconeClient()

  await pinecone.init({
    environment: "us-east1-gcp",
    apiKey: process.env.PINECONE_API_KEY,
  })

  const index = pinecone.Index(PINECONE_INDEX_NAME)
  const vectorStore = await PineconeStore.fromExistingIndex(
    index,
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    }),
    undefined,
    "" // namespace to get specific documents
  )

  const model = new OpenAIChat({
    openAIApiKey: process.env.OPENAI_API_KEY,
  })

  const chain = ChatVectorDBQAChain.fromLLM(model, vectorStore)
  const response = await chain.call({
    question,
    max_tokens: 1000, // todo: pick up a sensible value
    temperature: 0,
    chat_history: chatHistory || [],
  })

  res.status(200).json(response)
}
