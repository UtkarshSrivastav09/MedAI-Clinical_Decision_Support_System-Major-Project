import requests
import json

url = "http://127.0.0.1:8000/api/consult_chat"
payload = {
    "history": [],
    "message": "I have a fever and a cough for 3 days."
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
