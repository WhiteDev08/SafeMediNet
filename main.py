import os
import asyncio
from datetime import datetime
from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from fastapi import FastAPI,Request
from loginAgent import run_login_agent
from global_state import GLOBAL_STATE
from mail_services import send_suspicion_email
from vitalAgent import run_vital_agent


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


import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin (only once)
if not firebase_admin._apps:
    cred = credentials.Certificate("diagnowise-ehr-encryption-firebase-adminsdk-fbsvc-02fad0e53d.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()


async def update_firebase_global_state(user_id: str, role: str, state: dict):
    """
    Pushes the updated global state back to the corresponding user's document in Firestore.
    """
    try:

        collection_name = (
            "doctors" if role == "doctor"
            else "nurses" if role == "nurse"
            else "patients"
        )
        doc_ref = db.collection(collection_name).document(user_id)
        
        # Update or create a 'session_state' field
        doc_ref.set({"session_state": state}, merge=True)
        print(f"✅ Firebase updated for {user_id} ({role})")
    except Exception as e:
        print(f"❌ Failed to update Firebase: {e}")



class MCPServer:
    def __init__(self):
        self.client = None

    async def create_client(self):
        if self.client is None:
            print("🚀 Initializing MCP client...")
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
            print("✅ MCP client initialized successfully.")
        return self.client

    async def get_tools(self):
        if not self.client:
            await self.create_client()
        try:
            tools = await self.client.get_tools()
            print(f"Loaded tools: {[t.name for t in tools]}")
            return tools
        except Exception as e:
            print(f"❌ Failed to load MCP tools: {e}")
            raise



server = MCPServer()

@app.on_event("startup")
async def startup_event():
    print("⚙️ Starting up FastAPI + MCP client...")
    await server.create_client()
    print("✅ MCP client ready at startup.")



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


@app.post("/update_login")
async def update_login(request: Request):
    global GLOBAL_STATE
    """Called from frontend after each login attempt."""
    data = await request.json()

    GLOBAL_STATE.update(data.get("global_state", {}))
    password_correct = data.get("password_correct", False)
    login_time = data.get("login_time", "00:00")

    user_id = data.get("user_id", "UNKNOWN")
    role = data.get("role", "nurse")
    print(role)

    state = run_login_agent(password_correct, login_time)

    if(state["login_suspicion"]=="high"):
        send_suspicion_email(state['login_message'])
        GLOBAL_STATE["suspicious_password"]=0
        GLOBAL_STATE["suspicious_time"]=0

    print("Updated GLOBAL_STATE:", state)
    
    # 🔁 Push updated state to Firebase
    await update_firebase_global_state(user_id, role, state)

    return {"status": "success", "global_state": state}




@app.post("/update_vitals")
async def update_vitals(request: Request):
    """
    Called from frontend whenever vitals are submitted.
    Checks if patient exists, compares new parameters to previous ones,
    and records which ones changed.
    """
    data = await request.json()
    print("Recieved Data :",data)
    nurseId=data.get("nurseId")
    patient_id = data.get("patientId")
    new_params = data.get("parameters", {})
    timestamp = data.get("timestamp", datetime.now().isoformat())

    # Step 1: Validate patient
    if not patient_id:
        return {"error": "Patient ID missing"}

    # Step 2: Compare parameters for change detection
    changed = {}
    GLOBAL_STATE["previous_parameters"]=data.get("previousParameters")

    prev = GLOBAL_STATE["previous_parameters"]

    for key, value in new_params.items():
        if key not in prev or str(prev[key]) != str(value):
            changed[key] = {
                "old": prev.get(key),
                "new": value
            }

    # Step 3: Update global state
    GLOBAL_STATE["total_change"]=GLOBAL_STATE["total_change"] + 1

    if GLOBAL_STATE["total_change"] >3:
        run_vital_agent(prev, new_params, GLOBAL_STATE["total_change"])
        GLOBAL_STATE['total_change']=0

    GLOBAL_STATE["changed_parameters"] = changed
    GLOBAL_STATE["change_count"] = len(changed)
    GLOBAL_STATE["previous_parameters"] = new_params
    GLOBAL_STATE["timestamp"] = timestamp

    print("Updated GLOBAL_STATE:", GLOBAL_STATE)

    role="nurse"
    
    # 🔁 Push updated state to Firebase
    await update_firebase_global_state(nurseId, role, GLOBAL_STATE)

    # Step 4: Generate response
    if changed:
        return {
            "patient_id": patient_id,
            "changed_parameters": changed,
            "change_count": GLOBAL_STATE["change_count"],
            "timestamp": timestamp,
            "status": "Changes detected",
        }
    else:
        return {
            "patient_id": patient_id,
            "message": "No parameter changes detected.",
            "timestamp": timestamp,
        }