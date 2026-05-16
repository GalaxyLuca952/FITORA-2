import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html') or f.endswith('.js')]
found_emojis = {}
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    unmapped = set()
    for char in content:
        # Range check for typical emojis
        if ('\u2600' <= char <= '\u27bf') or ('\U0001f300' <= char <= '\U0001f64f') or ('\U0001f680' <= char <= '\U0001f6ff') or ('\U0001f900' <= char <= '\U0001f9ff') or ('\U0001fa70' <= char <= '\U0001faff') or char in ['⭐', '⚠️']:
            unmapped.add(char)
    if unmapped:
        found_emojis[file] = unmapped

if found_emojis:
    print("Found these emojis:")
    for k, v in found_emojis.items():
        print(f"{k}: {v}")
else:
    print("No emojis found anywhere!")
