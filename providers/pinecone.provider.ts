import { PineconeClient } from "@pinecone-database/pinecone"
import { Document } from "langchain/document"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { PineconeStore } from "langchain/vectorstores"

import { envs } from "../envs"

const PINECONE_INDEX_NAME = "data-gpt"

export const storeDocsInPineconeStore = async (
  docs: Document[],
  namespace?: string
) => {
  const pinecone = new PineconeClient()

  await pinecone.init({
    environment: "us-east1-gcp",
    apiKey: envs.PINECONE_API_KEY,
  })

  const index = pinecone.Index(PINECONE_INDEX_NAME)
  await PineconeStore.fromDocuments(
    index,
    docs,
    new OpenAIEmbeddings({
      openAIApiKey: envs.OPENAI_API_KEY,
    }),
    undefined,
    namespace // namespace to separate documents
  )
}
export const getVectorFromPineconeStore = async (namespace?: string) => {
  const pinecone = new PineconeClient()

  await pinecone.init({
    environment: "us-east1-gcp",
    apiKey: envs.PINECONE_API_KEY,
  })

  const index = pinecone.Index(PINECONE_INDEX_NAME)
  const vectorStore = await PineconeStore.fromExistingIndex(
    index,
    new OpenAIEmbeddings({
      openAIApiKey: envs.OPENAI_API_KEY,
    }),
    undefined,
    namespace // namespace to get specific documents
  )
  return vectorStore
}
