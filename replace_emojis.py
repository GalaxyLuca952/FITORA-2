import os
import re

emoji_map = {
    '👋': '<i class="fa-solid fa-hand" style="color: #ffc107;"></i>',
    '📜': '<i class="fa-solid fa-scroll" style="color: #ffeb3b;"></i>',
    '📊': '<i class="fa-solid fa-chart-simple" style="color: #03a9f4;"></i>',
    '🎵': '<i class="fa-solid fa-music" style="color: #e91e63;"></i>',
    '📍': '<i class="fa-solid fa-location-dot" style="color: #f44336;"></i>',
    '👨': '<i class="fa-solid fa-user" style="color: #03a9f4;"></i>',
    '👩': '<i class="fa-solid fa-user" style="color: #e91e63;"></i>',
    '🧍': '<i class="fa-solid fa-person" style="color: #ffffff;"></i>',
    '👤': '<i class="fa-solid fa-user" style="color: #9e9e9e;"></i>',
    '🛰': '<i class="fa-solid fa-satellite" style="color: #9e9e9e;"></i>',
    '🤖': '<i class="fa-solid fa-robot" style="color: #9c27b0;"></i>',
    '📲': '<i class="fa-solid fa-mobile-screen" style="color: #4caf50;"></i>',
    '📝': '<i class="fa-solid fa-clipboard-list" style="color: #ffeb3b;"></i>',
    '✍': '<i class="fa-solid fa-pen" style="color: #03a9f4;"></i>',
    '📋': '<i class="fa-solid fa-clipboard-list" style="color: #ffeb3b;"></i>',
    '💚': '<i class="fa-solid fa-heart" style="color: #4caf50;"></i>',
    '🤔': '<i class="fa-solid fa-question" style="color: #ffc107;"></i>',
    '🔐': '<i class="fa-solid fa-lock" style="color: #ff9800;"></i>',
    '🔒': '<i class="fa-solid fa-lock" style="color: #ff9800;"></i>',
    '📷': '<i class="fa-solid fa-camera" style="color: #607d8b;"></i>',
    '⚕': '<i class="fa-solid fa-staff-snake" style="color: #03a9f4;"></i>',
    '🏥': '<i class="fa-solid fa-hospital" style="color: #f44336;"></i>',
    '📧': '<i class="fa-solid fa-envelope" style="color: #ff5722;"></i>',
    '😊': '<i class="fa-solid fa-face-smile" style="color: #4caf50;"></i>',
    '😌': '<i class="fa-solid fa-face-smile" style="color: #4caf50;"></i>',
    '🔄': '<i class="fa-solid fa-rotate" style="color: #03a9f4;"></i>',
    '🔴': '<i class="fa-solid fa-circle" style="color: #f44336;"></i>',
    '🔔': '<i class="fa-solid fa-bell" style="color: #ffeb3b;"></i>',
    '📱': '<i class="fa-solid fa-mobile" style="color: #607d8b;"></i>',
    '🤷': '<i class="fa-solid fa-person-circle-question" style="color: #9e9e9e;"></i>',
    '😴': '<i class="fa-solid fa-bed" style="color: #3f51b5;"></i>',
    '🦵': '<i class="fa-solid fa-bone" style="color: #ffeb3b;"></i>',
    '😔': '<i class="fa-solid fa-face-frown" style="color: #f44336;"></i>',
    '😵': '<i class="fa-solid fa-face-dizzy" style="color: #f44336;"></i>',
    '🌙': '<i class="fa-solid fa-moon" style="color: #3f51b5;"></i>',
    '😤': '<i class="fa-solid fa-face-angry" style="color: #f44336;"></i>',
    '✨': '<i class="fa-solid fa-wand-magic-sparkles" style="color: #ffeb3b;"></i>',
    '🌟': '<i class="fa-solid fa-star" style="color: #ffeb3b;"></i>',
    '🔙': '<i class="fa-solid fa-arrow-left" style="color: #ffffff;"></i>',
    '🤯': '<i class="fa-solid fa-head-side-virus" style="color: #ff5722;"></i>',
    '📅': '<i class="fa-regular fa-calendar" style="color: #03a9f4;"></i>',
    '🗓': '<i class="fa-regular fa-calendar" style="color: #03a9f4;"></i>',
    '👑': '<i class="fa-solid fa-crown" style="color: #ffc107;"></i>',
    '🔬': '<i class="fa-solid fa-microscope" style="color: #9c27b0;"></i>',
    '🔗': '<i class="fa-solid fa-link" style="color: #9e9e9e;"></i>',
    '🏅': '<i class="fa-solid fa-medal" style="color: #ffc107;"></i>',
    '🗑': '<i class="fa-solid fa-trash" style="color: #f44336;"></i>',
    '💬': '<i class="fa-regular fa-message" style="color: #03a9f4;"></i>',
    '💡': '<i class="fa-solid fa-lightbulb" style="color: #ffeb3b;"></i>',
    '✓': '<i class="fa-solid fa-check" style="color: #4caf50;"></i>',
    '💾': '<i class="fa-solid fa-floppy-disk" style="color: #03a9f4;"></i>',
    '📓': '<i class="fa-solid fa-book" style="color: #795548;"></i>',
    '🍗': '<i class="fa-solid fa-drumstick-bite" style="color: #795548;"></i>',
    '🧃': '<i class="fa-solid fa-glass-water" style="color: #00bcd4;"></i>',
    '☀': '<i class="fa-solid fa-sun" style="color: #ffeb3b;"></i>',
    '🍽': '<i class="fa-solid fa-utensils" style="color: #9e9e9e;"></i>',
    '🥑': '<i class="fa-solid fa-carrot" style="color: #4caf50;"></i>',
    '🥩': '<i class="fa-solid fa-bacon" style="color: #f44336;"></i>',
    '⚖': '<i class="fa-solid fa-scale-balanced" style="color: #9e9e9e;"></i>',
    '🍝': '<i class="fa-solid fa-bowl-food" style="color: #ff9800;"></i>',
    '🥚': '<i class="fa-solid fa-egg" style="color: #ffeb3b;"></i>',
    '🥣': '<i class="fa-solid fa-bowl-rice" style="color: #e0e0e0;"></i>',
    '🍚': '<i class="fa-solid fa-bowl-rice" style="color: #ffffff;"></i>',
    '🐟': '<i class="fa-solid fa-fish" style="color: #03a9f4;"></i>',
    '🩺': '<i class="fa-solid fa-stethoscope" style="color: #03a9f4;"></i>',
    '👫': '<i class="fa-solid fa-user-group" style="color: #4caf50;"></i>',
    '🕒': '<i class="fa-regular fa-clock" style="color: #ff9800;"></i>',
    '🕔': '<i class="fa-regular fa-clock" style="color: #ff9800;"></i>',
    '🕐': '<i class="fa-regular fa-clock" style="color: #ff9800;"></i>',
    '💓': '<i class="fa-solid fa-heart-pulse" style="color: #f44336;"></i>',
    '🧗': '<i class="fa-solid fa-person-hiking" style="color: #795548;"></i>',
    '🚶': '<i class="fa-solid fa-person-walking" style="color: #8bc34a;"></i>',
    '🤝': '<i class="fa-solid fa-handshake" style="color: #ffeb3b;"></i>'
}

html_files = [f for f in os.listdir('.') if f.endswith('.html') or f.endswith('.js')]
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    for emoji, icon in emoji_map.items():
        new_content = new_content.replace(emoji, icon)

    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")

print("Emoji replacement complete!")
