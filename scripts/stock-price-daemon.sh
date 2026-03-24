#!/bin/bash
# Stock price daemon — runs once daily at market close (4:05 PM ET = 2:05 PM MST)
while true; do
    # Check if it's a weekday and around market close time (2:00-2:10 PM MST)
    HOUR=$(TZ="America/Phoenix" date +%H)
    DOW=$(TZ="America/Phoenix" date +%u)  # 1=Mon, 7=Sun
    
    if [ "$DOW" -le 5 ] && [ "$HOUR" -eq 14 ]; then
        echo "$(date): Running stock price update..."
        python3 /data/.openclaw/workspace/homebuilder/scripts/update-stock-prices.py >> /tmp/stock-update.log 2>&1
        # Sleep past this hour to avoid double-run
        sleep 900
    fi
    
    # Check every 10 minutes
    sleep 600
done
