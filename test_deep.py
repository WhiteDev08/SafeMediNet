from deepeval import assert_test
from deepeval.test_case import LLMTestCase,LLMTestCaseParams
from deepeval.metrics import GEval

from loginAgent import run_login_agent

# Define test scenarios
test_scenarios = [
    {
        "input": {"password_correct": False, "login_time": "2025-10-25T23:30:00"},
        "expected_suspicion": "high",
        "reference_summary": (
            "High suspicion: multiple failed password attempts and late-night login. "
            "Security team should verify legitimacy."
        ),
    },
    {
        "input": {"password_correct": False, "login_time": "2025-10-25T03:00:00"},
        "expected_suspicion": "high",
        "reference_summary": (
            "High suspicion: incorrect password attempts during restricted hours."
        ),
    },
    {
        "input": {"password_correct": True, "login_time": "2025-10-25T10:30:00"},
        "expected_suspicion": "low",
        "reference_summary": (
            "Low suspicion: successful login during normal working hours. No alert needed."
        ),
    },
]

for test in test_scenarios:
    print(test.get("input"))

def test_correctness():
    correctness_metric=GEval(
        name="Correctness",
        criteria = "Check if the actual output is coinciding with the expected output.Check the login suspicion. The messaage can be anything but the suspicion level must be the same in both outputs.",
        evaluation_params=[LLMTestCaseParams.ACTUAL_OUTPUT,LLMTestCaseParams.EXPECTED_OUTPUT],
        threshold=0.5
    )
    
    for test in test_scenarios:
        state=test.get("input")
        op=run_login_agent(state["password_correct"],state["login_time"])
        test_case=LLMTestCase(
            input="Evauate the message recieved from the agent",
            expected_output=test.get("reference_summary"),
            actual_output=op.get("login_message")
        )

        assert_test(test_case,[correctness_metric])

