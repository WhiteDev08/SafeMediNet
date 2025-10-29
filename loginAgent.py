# login_agent.py
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from datetime import datetime
import os
from global_state import GLOBAL_STATE
import requests
from dotenv import load_dotenv

load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")


# ----------------------------- #
# 🧩 NODE FUNCTIONS
# ----------------------------- #

def check_password_node(state: dict):
    """Check if password was entered correctly and update count."""
    is_correct = state.get("password_correct", False)
    if not is_correct:
        GLOBAL_STATE["suspicious_password"] += 1
    return state


def get_public_ip():
    """Fetch the current public IP of this system."""
    services = [
        "https://api.ipify.org?format=text",
        "https://ifconfig.me/ip",
        "https://icanhazip.com"
    ]
    for url in services:
        try:
            r = requests.get(url, timeout=3)
            if r.status_code == 200:
                return r.text.strip()
        except Exception:
            continue
    return "Unavailable"


def check_ip_node(state: dict):
    """Print the current system's public IP (for logging or audit)."""
    CORRECT_IP= "223.178.85.30"
    current_ip = get_public_ip()
    
    if(current_ip!=CORRECT_IP):
        GLOBAL_STATE["login_suspicion"] = "medium"

    return state


def check_time_node(state: dict):
    """Check login time window for suspicious activity."""
    login_time_str = state.get("login_time", None)
    if not login_time_str:
        return state

    try:
        login_time = datetime.fromisoformat(login_time_str)
        print(f"⏰ Login hour: {login_time.hour}")
        if login_time.hour >= 22 or login_time.hour < 4:  # 10 PM to 4 AM
            GLOBAL_STATE["suspicious_time"] += 1
    except Exception as e:
        print("Time parse error:", e)
    return state


def compute_suspicion_node(state: dict):
    """Determine overall suspicion level."""
    pw = GLOBAL_STATE["suspicious_password"]
    t = GLOBAL_STATE["suspicious_time"]

    if pw > 4 and t == 0:
        GLOBAL_STATE["login_suspicion"] = "high"
    elif pw >= 2 and t > 0:
        GLOBAL_STATE["login_suspicion"] = "high"
    elif pw == 0 and t > 3:
        GLOBAL_STATE["login_suspicion"] = "medium"
    else:
        GLOBAL_STATE["login_suspicion"] = "low"
    return state


def generate_message_node(state: dict):
    """LLM generates contextual message based on suspicion level."""
    suspicion = GLOBAL_STATE["login_suspicion"]
    llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.3)
    
    prompt = f"""
    You are an AI Security Auditor monitoring login activities for a hospital's Electronic Health Record (EHR) portal. 

Using the information below, compose a concise and professional email body for the hospital's cybersecurity team to review a potential access anomaly.

Suspicion Level: {suspicion}
Incorrect Password Attempts: {GLOBAL_STATE["suspicious_password"]}
Suspicious Time Occurrences: {GLOBAL_STATE["suspicious_time"]}

Guidelines:
- Maintain a formal and objective tone.
- Keep the message short but sufficiently detailed to convey concern.
- Do not include a subject line.
- End the message with:

Please verify if this activity was legitimate.

Regards,  
EHR Security Agent
    """

    if suspicion in ("high", "medium"):
        resp = llm.invoke(prompt)
        GLOBAL_STATE["login_message"] = resp.content.strip()

    return state


# ----------------------------- #
# 🧱 BUILD LANGGRAPH
# ----------------------------- #
graph = StateGraph(dict)
graph.add_node("check_password", check_password_node)
graph.add_node("check_ip", check_ip_node)
graph.add_node("check_time", check_time_node)
graph.add_node("compute_suspicion", compute_suspicion_node)
graph.add_node("generate_message", generate_message_node)

# Node order: START → password → IP → time → suspicion → message → END
graph.add_edge(START, "check_password")
graph.add_edge("check_password", "check_ip")
graph.add_edge("check_ip", "check_time")
graph.add_edge("check_time", "compute_suspicion")
graph.add_edge("compute_suspicion", "generate_message")
graph.add_edge("generate_message", END)

login_agent_graph = graph.compile()


def run_login_agent(password_correct: bool, login_time: str):
    """Entry point callable from FastAPI."""
    state = {"password_correct": password_correct, "login_time": login_time}
    login_agent_graph.invoke(state)
    return GLOBAL_STATE

