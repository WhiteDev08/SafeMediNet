from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv

load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

system_prompt = """
You are a professional Data Security Expert who specializes in analyzing threat levels.
You will receive two batches of parameters:
1️⃣ Previous parameters
2️⃣ Updated parameters

Your job is to analyze what parameters were changed by the nurse and how many times.

Previous Parameters:
{previous_parameters}

Changed Parameters:
{changed_parameters}

Total number of times the nurse has changed the patient's data till now:
{total_change}

Using this information, provide a short, professional message to the doctor summarizing the changes made by the nurse.
"""

def run_vital_agent(previous_parameters, changed_parameters, total_change):
    # Build the chat prompt
    prompt = ChatPromptTemplate.from_template(system_prompt)

    # Initialize LLM
    llm = ChatOpenAI(model="gpt-4o-mini")  # You can also use "gpt-3.5-turbo"

    # Compose the chain
    chain = prompt | llm

    # Invoke the model
    response = chain.invoke({
        "previous_parameters": previous_parameters,
        "changed_parameters": changed_parameters,
        "total_change": total_change
    })

    # Print the LLM's message content
    print("\n🧠 AI Response:")
    print(response.content)

# Example test data
previousParameters = {
    "heartRate": 82,
    "systolicBP": 122,
    "diastolicBP": 79,
    "temperature": 37.0,
    "oxygenSaturation": 98,
    "respiratoryRate": 16,
    "bloodGlucose": 90,
    "weight": 70.2,
    "height": 170
}

parameters = {
    "heartRate": 90,
    "systolicBP": 120,
    "diastolicBP": 80,
    "temperature": 37.2,
    "oxygenSaturation": 95,
    "respiratoryRate": 18,
    "bloodGlucose": 95,
    "weight": 70.2,
    "height": 170
}

