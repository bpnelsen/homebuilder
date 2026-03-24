#!/usr/bin/env python3
"""Daily stock price updater — fetches live prices and pushes to Supabase."""
import urllib.request, json, time, os

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://rrpkokhjomvlumreknuq.supabase.co")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycGtva2hqb212bHVtcmVrbnVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTkwOTU5MSwiZXhwIjoyMDg3NDg1NTkxfQ.kFTdS-I7SnPPkgqYu0amlzLQgnGJppb4ZKkfIyCy0JA")
BASE_URL = f"{SUPABASE_URL}/rest/v1"

# Shares outstanding (millions) for market cap calculation
BUILDERS = {
    "LEN":  {"builder_id": "8d9e7b9a-25e5-4131-a7cc-237cc5e2dfdc", "shares": 262.3},
    "DHI":  {"builder_id": "da5b6c50-a5d7-418a-a6a7-0285ab0872f7", "shares": 669.3},
    "KBH":  {"builder_id": "b12270ca-7a5f-49eb-a23c-df56e07a9351", "shares": 60.2},
    "TOL":  {"builder_id": "4d9921b2-e620-494d-8072-2745a2c29eb4", "shares": 101.5},
    "PHM":  {"builder_id": "8893eb7c-e11f-4fb2-a5d8-3a4afe07e9d8", "shares": 208.4},
    "NVR":  {"builder_id": "e59ed808-1c5e-46cb-a19c-d28018d03bc2", "shares": 3.05},
    "TPH":  {"builder_id": "42b65feb-7b86-435d-a6a6-fdc633a5892c", "shares": 94.5},
    "CVCO": {"builder_id": "914c2088-68bd-4e6d-bd6d-13443d9081b4", "shares": 8.0},
    "LGIH": {"builder_id": "56088c83-67ed-4388-9733-55ab26c06d23", "shares": 23.6},
}

def fetch_price(ticker):
    """Fetch current price and previous close from Yahoo Finance."""
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?interval=1d&range=5d"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.load(resp)
            meta = data["chart"]["result"][0]["meta"]
            price = meta.get("regularMarketPrice", 0)
            prev = meta.get("chartPreviousClose", 0)
            change = ((price - prev) / prev * 100) if prev else 0
            return {"price": price, "change": round(change, 2)}
    except Exception as e:
        print(f"  ⚠️  {ticker} fetch failed: {e}")
        return None

def update_supabase(ticker, info, data):
    """Insert new stock price record."""
    market_cap = data["price"] * info["shares"] * 1_000_000
    from datetime import datetime, timezone
    payload = json.dumps({
        "builder_id": info["builder_id"],
        "price": data["price"],
        "market_cap": market_cap,
        "change_percent": data["change"],
        "date": datetime.now(timezone.utc).isoformat(),
    }).encode("utf-8")
    
    req = urllib.request.Request(
        f"{BASE_URL}/stock_prices",
        data=payload,
        headers={
            "apikey": SERVICE_KEY,
            "Authorization": f"Bearer {SERVICE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in [200, 201, 204]:
                mc = f"${market_cap/1e9:.1f}B" if market_cap >= 1e9 else f"${market_cap/1e6:.0f}M"
                print(f"  ✅ {ticker}: ${data['price']:.2f} ({data['change']:+.1f}%) MktCap: {mc}")
                return True
    except Exception as e:
        print(f"  ❌ {ticker} push failed: {e}")
    return False

def main():
    from datetime import datetime
    print(f"📊 Stock Price Update — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    
    success = 0
    for ticker, info in BUILDERS.items():
        data = fetch_price(ticker)
        if data and data["price"] > 0:
            if update_supabase(ticker, info, data):
                success += 1
        time.sleep(0.5)
    
    print(f"\n✅ Updated {success}/{len(BUILDERS)} builders")

if __name__ == "__main__":
    main()
