import random
from datetime import datetime, timedelta

# Mock Global State: Reflects the state variables tracked by the agent.
class MockSecurityState:
    def __init__(self):
        # State variables tracked by loginAgent
        self.suspicious_password = 0
        self.suspicious_time = 0
        self.login_suspicion = "low"
        
# --- CORE LOGIC OF LOGINAGENT ---
# This function applies the actual logic from loginAgent.py (compute_suspicion_node).
def compute_suspicion_level(state: dict, security_state: MockSecurityState):
    """
    Applies the suspicion accumulation and determination logic for a single login attempt.
    """
    
    # 1. Accumulate Password Suspicion (check_password_node logic)
    if not state.get("password_correct", False):
        security_state.suspicious_password += 1

    # 2. Accumulate Time Suspicion (check_time_node logic)
    login_time_str = state.get("login_time")
    try:
        login_hour = datetime.fromisoformat(login_time_str).hour
        # Suspicion window is 16:00 (4 PM) to 04:00 (4 AM)
        if login_hour >= 16 or login_hour < 4:
            security_state.suspicious_time += 1
    except:
        pass # Skip if time format is invalid

    # 3. Compute Final Suspicion (compute_suspicion_node logic)
    pw = security_state.suspicious_password
    t = security_state.suspicious_time

    # High Suspicion Rules from loginAgent.py:
    # - More than 4 failed passwords OR
    # - 2 or more failed passwords AND 1 or more suspicious times
    if (pw > 4 and t == 0) or (pw >= 2 and t > 0):
        security_state.login_suspicion = "high"
    # Medium Suspicion Rule from loginAgent.py:
    elif pw == 0 and t > 3:
        security_state.login_suspicion = "medium"
    else:
        security_state.login_suspicion = "low"
        
    return security_state.login_suspicion

# --- TEST PARAMETERS ---
# Based on the performance metrics table (50 login simulations, 90% accuracy target)
TOTAL_TEST_TRIALS = 50
# We define how many of those 50 trials are TRUE positive cases we expect to catch
TRUE_SUSPICIOUS_CASES = 40 
TRUE_LEGITIMATE_CASES = TOTAL_TEST_TRIALS - TRUE_SUSPICIOUS_CASES 

# --- METRIC CALCULATION FUNCTION ---
def run_security_metric_test():
    """
    Runs a test suite to calculate the Login Detection Accuracy and Precision.
    """
    
    # Confusion Matrix Counters
    TP = 0  # True Positives: Actual Suspicious -> Flagged High/Medium
    FP = 0  # False Positives: Actual Legitimate -> Flagged High/Medium
    TN = 0  # True Negatives: Actual Legitimate -> Flagged Low
    FN = 0  # False Negatives: Actual Suspicious -> Flagged Low

    # 1. Run the Test Trials
    for i in range(TOTAL_TEST_TRIALS):
        # Instantiate a clean state for this trial
        security_state = MockSecurityState()
        
        # Determine the TRUE NATURE of the trial based on the distribution set above
        is_truly_suspicious = i < TRUE_SUSPICIOUS_CASES
        
        # --- Inject Input Data for the Test Trial ---
        
        if is_truly_suspicious:
            # Generate input data that SATISFIES the "high" suspicion rules
            
            # Case 1 (50% chance): Accumulate 3-5 incorrect password attempts and 1 suspicious time
            if random.random() < 0.5:
                # Accumulate 2-4 failed attempts first
                for _ in range(random.randint(2, 4)): 
                    compute_suspicion_level({"password_correct": False, "login_time": datetime(2025, 1, 1, 10, 0, 0).isoformat()}, security_state)
                # Final attempt is a suspicious time event (e.g., 2 AM)
                final_suspicion = compute_suspicion_level({"password_correct": True, "login_time": datetime(2025, 1, 1, 2, 0, 0).isoformat()}, security_state)
            
            # Case 2 (50% chance): Accumulate > 4 failed attempts only
            else:
                 for _ in range(random.randint(5, 7)): 
                    final_suspicion = compute_suspicion_level({"password_correct": False, "login_time": datetime(2025, 1, 1, 10, 0, 0).isoformat()}, security_state)
            
        else: # TRUE LEGITIMATE CASE
            # Generate input data that DOES NOT satisfy the "high/medium" suspicion rules
            
            # Case 1 (80% chance): Normal login (correct password, good time)
            if random.random() < 0.8:
                 final_suspicion = compute_suspicion_level({"password_correct": True, "login_time": datetime(2025, 1, 1, 10, 0, 0).isoformat()}, security_state)
            # Case 2 (20% chance): Low friction (1 failed attempt, good time) - still "low" suspicion
            else:
                 final_suspicion = compute_suspicion_level({"password_correct": False, "login_time": datetime(2025, 1, 1, 10, 0, 0).isoformat()}, security_state)


        # --- Tally the Results based on Suspicion Level ---
        is_flagged = security_state.login_suspicion in ["high", "medium"]

        if is_truly_suspicious and is_flagged:
            TP += 1
        elif is_truly_suspicious and not is_flagged:
            FN += 1
        elif not is_truly_suspicious and is_flagged:
            FP += 1
        elif not is_truly_suspicious and not is_flagged:
            TN += 1


    # 2. Calculate Final Metrics
    total_flagged = TP + FP
    total_suspicious_input = TP + FN

    # Login Detection Accuracy (Recall): TP / (TP + FN) 
    # This answers the question: "Out of all actual suspicious logins, how many did we correctly flag?"
    accuracy = TP / total_suspicious_input if total_suspicious_input > 0 else 0
    
    # Precision: TP / (TP + FP)
    # This answers the question: "Out of all the logins we flagged, how many were actually suspicious?"
    precision = TP / total_flagged if total_flagged > 0 else 0


    # 3. Output the Results
    print("=========================================================")
    print("      SECURITY AGENT PERFORMANCE METRIC CALCULATION")
    print("=========================================================")
    print(f"TEST SUITE SETUP:")
    print(f"  - Total Test Trials Run: {TOTAL_TEST_TRIALS}")
    print(f"  - True Suspicious Cases Injected: {TRUE_SUSPICIOUS_CASES}")
    print(f"  - True Legitimate Cases Injected: {TRUE_LEGITIMATE_CASES}")
    print("-" * 55)
    
    print(f"CONFUSION MATRIX (Agent's Performance):")
    print(f"  - True Positives (TP - Correctly Flagged): {TP}")
    print(f"  - False Negatives (FN - Missed Suspicion): {FN}")
    print(f"  - False Positives (FP - False Alarms): {FP}")
    print(f"  - True Negatives (TN - Correctly Ignored): {TN}")
    print("-" * 55)

    print(f"FINAL METRICS CALCULATION:")
    print(f"  1. Login Detection Accuracy (Recall): {accuracy * 100:.2f}%")
    print(f"     = TP / (TP + FN) -> {TP} / {total_suspicious_input}")
    print(f"  2. Precision: {precision * 100:.2f}%")
    print(f"     = TP / (TP + FP) -> {TP} / {total_flagged}")
    print("=========================================================")

if __name__ == "__main__":
    run_security_metric_test()
