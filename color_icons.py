import os
import re

color_map = {
    'fa-person-running': '#ff5722',
    'fa-dumbbell': '#9c27b0',
    'fa-person-swimming': '#03a9f4',
    'fa-person-biking': '#4caf50',
    'fa-person-praying': '#e91e63',
    'fa-futbol': '#ffffff',
    'fa-table-tennis-paddle-ball': '#cddc39',
    'fa-hand-fist': '#f44336',
    'fa-person-hiking': '#795548',
    'fa-burst': '#ff9800',
    'fa-music': '#e040fb',
    'fa-fire': '#ff5722',
    'fa-bolt': '#facc15',
    'fa-trophy': '#ffc107',
    'fa-bullseye': '#f44336',
    'fa-heart': '#f44336',
    'fa-users': '#03a9f4',
    'fa-globe': '#4caf50',
    'fa-tree': '#8bc34a',
    'fa-droplet': '#00bcd4',
    'fa-house': '#795548',
    'fa-battery-full': '#4caf50',
    'fa-triangle-exclamation': '#ff9800',
    'fa-shield': '#03a9f4',
    'fa-face-tired': '#f44336',
    'fa-face-frown': '#ff9800',
    'fa-face-meh': '#ffeb3b',
    'fa-face-smile': '#8bc34a',
    'fa-face-laugh-beam': '#4caf50',
    'fa-brain': '#e91e63',
    'fa-hand-sparkles': '#ff9800',
    'fa-stopwatch': '#607d8b',
    'fa-clock': '#9e9e9e',
    'fa-arrow-trend-up': '#4caf50',
    'fa-thumbs-down': '#f44336',
    'fa-thumbs-up': '#4caf50',
    'fa-seedling': '#8bc34a',
    'fa-arrow-trend-down': '#f44336',
    'fa-calendar': '#9c27b0',
    'fa-check': '#4caf50',
    'fa-star': '#facc15',
    'fa-pizza-slice': '#ff9800',
    'fa-bowl-food': '#4caf50',
    'fa-apple-whole': '#f44336',
    'fa-xmark': '#f44336',
    'fa-rocket': '#ff5722',
    'fa-leaf': '#4caf50'
}

html_files = [f for f in os.listdir('.') if f.endswith('.html') or f.endswith('.js')]
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    # Look for icons that lack a style attribute
    for c_name, color in color_map.items():
        # Match <i class="... fa-iconName"></i> or similar, ensuring it doesn't already have style="color:"
        new_content = re.sub(
            r'(<i\s+class="[^"]*?\b' + c_name + r'\b[^"]*")\s*>(?!.*?</i>)',
            r'\1 style="color: ' + color + r';">',
            new_content
        )
        new_content = re.sub(
            r'(<i\s+class=\'[^\']*?\b' + c_name + r'\b[^\']*\'(?:\s*))>(?!.*?</i>)',
            r'\1 style="color: ' + color + '; ">',
            new_content
        )
        # Handle cases where it has class but no style
        new_content = re.sub(
            r'(<i[^>]+class="[^"]*' + c_name + r'[^"]*"[^>]*)>',
            lambda m: m.group(1) + '>' if 'style=' in m.group(1) else m.group(1) + f' style="color: {color};">',
            new_content
        )

    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated colored icons in {file}")

print("Coloring complete!")
