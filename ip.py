import requests
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


ip=get_public_ip()

print(ip)