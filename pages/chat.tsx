import React, { useCallback, useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { cn } from "@/providers/utils"
import { Bot, Loader2, Send, User } from "lucide-react"

import { siteConfig } from "@/config/site"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"

const DEFAULT_QUESTION = ""

export default function IndexPage() {
  const [question, setQuestion] = useState(DEFAULT_QUESTION)

  const [isAsking, setIsAsking] = useState(false)
  const [chatHistory, setChatHistory] = useState([])

  const handleQueryChange = (e) => {
    setQuestion(e.target.value)
  }

  const handleSubmit = useCallback(async () => {
    if (!question) {
      return
    }
    setIsAsking(true)
    setQuestion("")
    setChatHistory([
      ...chatHistory,
      {
        role: "user",
        content: question,
      },
    ])

    const response = await fetch("/api/chat-bot", {
      body: JSON.stringify({
        question,
        chatHistory,
      }),
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    })
    const answer = await response.json()
    console.log(answer)

    if (answer.content) {
      setChatHistory((currentChatHistory) => [
        ...currentChatHistory,
        {
          role: "assistant",
          content: answer.content,
        },
      ])
    }
    if (answer.error) {
      console.error(answer.error)
    }

    setIsAsking(false)
  }, [question, chatHistory])

  return (
    <Layout>
      <Head>
        <title>{siteConfig.name}</title>
        <meta name="description" content={siteConfig.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="container flex justify-items-stretch gap-6 pt-6 pb-8 md:py-10">
        <div className="flex grow flex-col items-start gap-2">
          <h2 className="mt-10 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
            Talk with me!
          </h2>

          <div className="w-full">
            <div className="scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch flex min-h-[300px] flex-col space-y-4 overflow-y-auto rounded border border-gray-400 p-4">
              {chatHistory.map((chat, index) => {
                return (
                  <div className="chat-message" key={index}>
                    <div
                      className={cn(
                        "flex",
                        "items-end",
                        chat.role === "assistant" && "justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "order-2 mx-2 flex max-w-xs flex-col items-start space-y-2 text-xs",
                          chat.role === "assistant" && "order-1"
                        )}
                      >
                        <div>
                          <span
                            className={cn(
                              "inline-block rounded-lg bg-gray-300 px-4 py-2 text-gray-600",
                              chat.role === "user" &&
                                "rounded-bl-none bg-gray-300 text-gray-600",
                              chat.role === "assistant" &&
                                "rounded-br-none bg-blue-600 text-white"
                            )}
                          >
                            {chat.content}
                          </span>
                        </div>
                      </div>
                      {chat.role === "user" ? (
                        <User className="order-1 h-4 w-4" />
                      ) : (
                        <Bot className="order-1 h-4 w-4" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <form>
              <div className="mb-2 pt-4 sm:mb-0">
                <div className="relative flex">
                  <input
                    type="text"
                    value={question}
                    placeholder={DEFAULT_QUESTION}
                    onChange={handleQueryChange}
                    className="mr-2 w-full rounded-md border border-gray-400 pl-2 text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
                  />
                  <div className="items-center sm:flex">
                    <Button
                      onClick={handleSubmit}
                      disabled={!question}
                      type="submit"
                    >
                      {!isAsking ? (
                        <Send className="h-4 w-4" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  )
}
