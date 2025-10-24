import os
import asyncio
from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from fastapi import FastAPI,Request

load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

app = FastAPI()
llm = ChatOpenAI(model="gpt-3.5-turbo")


from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or replace "*" with your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MCPServer:
    async def create_client(self):
        self.client = MultiServerMCPClient({
            "statpearls-mcp": {
                "command": "npx",
                "args": [
                    "-y",
                    "@smithery/cli@latest",
                    "run",
                    "@jpoles1/statpearls-mcp",
                    "--key",
                    "46e8e5fd-518d-4461-b6fc-9e4a09739e88"
                ],
                "transport": "stdio"
            }
        })
        
        return self.client

    async def get_tools(self):
        # ✅ Ensure client is created and connected
        self.client = await self.create_client()
        tools = await self.client.get_tools()
        print(f"Loaded tools: {[t.name for t in tools]}")
        return tools


server = MCPServer()


@app.post("/askServer/")
async def chat(request: Request):
    body = await request.json()
    query = body.get("query", "")

    tools = await server.get_tools()
    agent = create_react_agent(llm, tools)

    llm_prompt = """
You are a professional medical expert specializing in analyzing medical parameters and identifying possible diseases. 
You also have access to various tools that can provide information about basic health metrics such as blood pressure, 
glucose levels, and other vital signs. 

Your task is to accurately answer the user's medical queries, analyze the given parameters, and clearly explain the 
medical context and reasoning behind your conclusions.
"""

    response = await agent.ainvoke({
        "messages": [
            {"role": "system", "content": llm_prompt},
            {"role": "user", "content": query}
        ]
    })

    final_answer = response["messages"][-1].content
    return {"response": final_answer}
