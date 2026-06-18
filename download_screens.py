import os
import urllib.request

output_dir = r"C:\Users\shiva\OneDrive\Documents\GitHub\cura-chatbot\stitch_screens"
os.makedirs(output_dir, exist_ok=True)

screens = [
    {
        "name": "Home Page",
        "screenshot": "https://lh3.googleusercontent.com/aida/AP1WRLsz6vbgj31zTKdFtB7WWiVWb-ks2QPT6S4jkQcUH6Vgkiog_epJAFagmRSLoJpLUYb83CUzX36Z7lWNso7zoA9I4ppi9a_Zeu_NrewBi-NYDGhCtJlqCxcVZKyKIXSu0hlspSDzGE_mkUAEhspAQEnAnqmNkzczvVzbq7rUMtc4GJ1Vs6lbXocte3Pz20cKlQyE1qovfEuP_75RqFxEcfMtjZJbthLgvXdITRzGWjRwNKJTxUhmaDxvbWc",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzQyZDg2NTYyODU2MDRmMjlhZjg3YmU1M2M1NjEwNDMyEgsSBxC8wu-guAgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDM5MjgxMzI1MzQ5MTU1OTQzNg&filename=&opi=89354086"
    },
    {
        "name": "Chatbot Interface",
        "screenshot": "https://lh3.googleusercontent.com/aida/AP1WRLs2VyWZlJekh3AtLGbiDo_5uP8AuKCb__swVrn4WTTH8dPQg7r9vA0mpJyyhB9BL7eD6Ojwi6Rz3et2OKTPBeRAfYy7vo5oou9x61e63lRfXAHhibTUEtcrOpE8NmDVE_bIjNGz5DjPCfr2IDOrSvhtqheSWMbiCj4N9OLJlXIlvs9l-A79kRBH3fZk8I1PlcG-YS4WIgK_YEt-oVWGx9snwOQ7RjA0AuWOUw8liSsxv_UzCNJ7VEl3kbM5",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzQ4YzMxOTgzZjk2ZjQyOGY5YjAzMTExM2JmNWM3NDY5EgsSBxC8wu-guAgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDM5MjgxMzI1MzQ5MTU1OTQzNg&filename=&opi=89354086"
    },
    {
        "name": "User Dashboard",
        "screenshot": "https://lh3.googleusercontent.com/aida/AP1WRLsgDzUJiJXipnIEYAwRuM60D6GqvBnIiiS7WziF3tHjf8_keTVVLY7_JI1YZbs74t0__hljBQh7ORSZIc_jx7aOUhrb_ph0hhSA8i6-GCPymB7GOUgFudv7tOdEyOjvRIo-wVHhfGUH8ycKScdJ3tHx-Qvt5S-1AgiZmAI7pe2hpPC-FFnn2LL0x0xr7gTIIXdcB_OO96sc6F1Ch8XZzUwhxODitqaSmqH2mc423JVewkx4sAWqoWSkyqgq",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzMxZmE3MmUwMDQ4NzRhMWQ4NjNiMzFiYzA3YzU2MGYyEgsSBxC8wu-guAgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDM5MjgxMzI1MzQ5MTU1OTQzNg&filename=&opi=89354086"
    },
    {
        "name": "Subscription Plans",
        "screenshot": "https://lh3.googleusercontent.com/aida/AP1WRLuH4n6NgeKHy6qb5LZkb4kRZLQ_6gC-Zgb_WwLgtcaN98R-I8Dyi-bWQm92JgM89p9BQR88VuYT6a_ZqAf34MupD1mgyLmfYg5fDn-YIbZRuffxGtVDpyP-blnEHP1EIJS7DevcMaDZKKiK0burtcH47y7xS8-6P_y3a1cktdsnoSTNVcM6feiJjUNFRe6HdXp1NE0u4s_ghwVZ_z3Mn9e15sMdrQ_6tgXIFusCpVzySzRxBMMq06Ld-i3M",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzdhNWJlNmU3YWQ3YzQ1YmU4MzhkM2Q2ZmRiMjFlZWY3EgsSBxC8wu-guAgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDM5MjgxMzI1MzQ5MTU1OTQzNg&filename=&opi=89354086"
    },
    {
        "name": "Admin Panel",
        "screenshot": "https://lh3.googleusercontent.com/aida/AP1WRLssiOWpl3vRIqfZwEk2rhgA_kpr7Va6kGkQxnhmkpH0ErlM687VGnYpA2eWr5lByqkwfyNrmRxFpjW2Xq3OiK4Le4S8x-w99hpC4SSrTGPztm4VzG5ARlVLRPGRmO4Q5OVslXtJmPNDc-xUkz9_5CdY9U2kbsr63bCXuYe0a0TM6V2IpJGGmTRIl3qVCq3dHAy8tP0CeaQmxwNBUvFrOVJB-KJjPwfrtHS5i2ZWaKLwc4TOhmBBYtV4kls",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAyZWMzOTczNjhhOTQ4NmI5NGU5MmQ4Yjk5MDRmYzM5EgsSBxC8wu-guAgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDM5MjgxMzI1MzQ5MTU1OTQzNg&filename=&opi=89354086"
    },
    {
        "name": "PDF Upload",
        "screenshot": "https://lh3.googleusercontent.com/aida/AP1WRLs10wLYQMsTmzoOdrgfTf1YsHoDBcbzVObjWXq8TeE7_Z_a2sOBHOd3wFPfL_zUtHIQBvKKfHfxEXmC6zxQCofzmGOCbbhdbNvs8u6d1lNDYD2c9f4eE3LC48o3KWQFN0f1RXkB9f6vlYjwI9VlLmGW3YCph0iLHwhaqPHV4RSyA6WSKuNm7LRTk233dclFg70N7oJec8Q25QU-CpmWRBhavmLrfsBYpZTij0boY3D0FRDLJNoJPXLnvdht",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2E4ZTliODY4ZTgzMTQzZjdhMWFlNzIzNDg1OGU5ZDg2EgsSBxC8wu-guAgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDM5MjgxMzI1MzQ5MTU1OTQzNg&filename=&opi=89354086"
    },
    {
        "name": "Login Signup",
        "screenshot": "https://lh3.googleusercontent.com/aida/AP1WRLtks48f81bOv795Tr2OjMzlqN-FMwSKYipyZhtiXhk0sVEHOe6NkF-UPya6arg9pmNq9M70IXYSt_C_USxQUxHDFIEqnXEOugrPUMQa1wNqnBG2jEqBRRJKSbwgfCq59IyTrmeyCAIiupYPoqVzZ6iYieKQ0XTKxGJAGHG8NXwfey5V6G3a-7KrcrsTB2XxqT5zyQZb45vvZZu7-5D-Bs-6PNu-UGbyjTq56TWUJxgvng1QsT5u1QBIU1IO",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2Y0NmNhNWQ3ZDU4ODQ2YWVhNDVmOTA0N2E5N2EyYzMxEgsSBxC8wu-guAgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDM5MjgxMzI1MzQ5MTU1OTQzNg&filename=&opi=89354086"
    },
    {
        "name": "Science Knowledge",
        "screenshot": "https://lh3.googleusercontent.com/aida/AP1WRLtqYBJa1ZLMxWoR0TRChAWFS1Bajpyh7jEVeB1QTof04OBKvIrOx-211rRGzNfiasa2DUb4xudqBZLG7JjnXlhsof1adXn3VpN9Hv2Hc2lpwdBO040Wq2dyWIRskpzeyzRJ3dNb9MsgKVEL9Q40ETpg499gh6pbIi1tLdsl4YumsG99VpS-c_jazDIc_BWwtc7QfNRMlPNKV_rNpHNkb4dgObdzmCAtlWRC8nfbatif6ZsC03eJF1iQR9AC",
        "html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2MxZTY0ZmEwODM1ZjQ0Yjg4YWRhZDk5NWEyNGRiYjlmEgsSBxC8wu-guAgYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDM5MjgxMzI1MzQ5MTU1OTQzNg&filename=&opi=89354086"
    }
]

for screen in screens:
    name_clean = screen["name"].replace(" ", "_").lower()
    
    html_path = os.path.join(output_dir, f"{name_clean}.html")
    print(f"Downloading {screen['name']} HTML...")
    req = urllib.request.Request(screen["html"], headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response, open(html_path, 'wb') as out_file:
            out_file.write(response.read())
    except Exception as e:
        print(f"Failed to download HTML for {screen['name']}: {e}")
        
    screenshot_path = os.path.join(output_dir, f"{name_clean}.png")
    print(f"Downloading {screen['name']} Screenshot...")
    req = urllib.request.Request(screen["screenshot"], headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response, open(screenshot_path, 'wb') as out_file:
            out_file.write(response.read())
    except Exception as e:
        print(f"Failed to download screenshot for {screen['name']}: {e}")

print("Done.")
