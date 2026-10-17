import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

os.makedirs('assets/icons', exist_ok=True)
os.makedirs('assets/splash', exist_ok=True)

FONT_PATH = '/System/Library/Fonts/Supplemental/Tamil Sangam MN.ttc'

def create_main_icon():
    size = 1024
    # Deep maroon background with warm subtle radial glow
    img = Image.new('RGBA', (size, size), (74, 14, 23, 255))
    draw = ImageDraw.Draw(img)

    # Decorative parchment inset
    padding = 64
    inner_box = [padding, padding, size - padding, size - padding]
    # Rounded rectangle inner border in gold
    gold = (212, 175, 55, 255)
    gold_soft = (235, 210, 120, 220)
    maroon_deep = (90, 18, 30, 255)
    ivory = (253, 251, 247, 255)

    # Outer gold border
    draw.rounded_rectangle(inner_box, radius=120, outline=gold, width=8)
    # Inner gold border
    inner_box2 = [padding + 24, padding + 24, size - padding - 24, size - padding - 24]
    draw.rounded_rectangle(inner_box2, radius=100, outline=gold_soft, width=3)

    # Center circle for the emblem
    center = (size // 2, size // 2 - 30)
    radius = 320
    draw.ellipse([center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius], 
                 fill=maroon_deep, outline=gold, width=10)
    
    # Concentric inner ring
    r2 = radius - 20
    draw.ellipse([center[0] - r2, center[1] - r2, center[0] + r2, center[1] + r2], 
                 outline=gold_soft, width=3)

    # Traditional palm leaf / book scroll motif at base of circle
    scroll_w = 260
    scroll_h = 32
    scroll_y = center[1] + 210
    draw.rounded_rectangle([center[0] - scroll_w//2, scroll_y, center[0] + scroll_w//2, scroll_y + scroll_h],
                           radius=12, fill=gold, outline=gold_soft, width=2)
    # Scroll ties
    draw.line([center[0] - scroll_w//4, scroll_y, center[0] - scroll_w//4, scroll_y + scroll_h], fill=(74, 14, 23, 255), width=4)
    draw.line([center[0] + scroll_w//4, scroll_y, center[0] + scroll_w//4, scroll_y + scroll_h], fill=(74, 14, 23, 255), width=4)

    # Tamil letter 'ஆ'
    try:
        font_large = ImageFont.truetype(FONT_PATH, 340, index=1)
        font_sub = ImageFont.truetype(FONT_PATH, 72, index=1)
    except Exception:
        font_large = ImageFont.truetype(FONT_PATH, 340, index=0)
        font_sub = ImageFont.truetype(FONT_PATH, 72, index=0)

    # Text measurement
    bbox = draw.textbbox((0, 0), "ஆ", font=font_large)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    text_x = center[0] - w // 2 - bbox[0]
    text_y = center[1] - h // 2 - bbox[1] - 30

    # Subtle gold glow shadow
    shadow_offset = 6
    draw.text((text_x + shadow_offset, text_y + shadow_offset), "ஆ", font=font_large, fill=(35, 6, 10, 200))
    draw.text((text_x, text_y), "ஆ", font=font_large, fill=gold)

    # Subtitle: ஆத்திச்சூடி at bottom
    sub_text = "ஆத்திச்சூடி"
    sub_bbox = draw.textbbox((0, 0), sub_text, font=font_sub)
    sub_w = sub_bbox[2] - sub_bbox[0]
    draw.text((size // 2 - sub_w // 2, size - padding - 110), sub_text, font=font_sub, fill=ivory)

    img.save('assets/icons/icon.png', 'PNG')
    print("Created assets/icons/icon.png")

def create_adaptive_icon():
    size = 1024
    # Transparent background for adaptive foreground
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    gold = (212, 175, 55, 255)
    gold_soft = (235, 210, 120, 220)
    maroon_deep = (90, 18, 30, 255)
    ivory = (253, 251, 247, 255)

    center = (size // 2, size // 2 - 20)
    radius = 280
    draw.ellipse([center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius], 
                 fill=maroon_deep, outline=gold, width=8)
    
    r2 = radius - 16
    draw.ellipse([center[0] - r2, center[1] - r2, center[0] + r2, center[1] + r2], 
                 outline=gold_soft, width=3)

    try:
        font_large = ImageFont.truetype(FONT_PATH, 300, index=1)
        font_sub = ImageFont.truetype(FONT_PATH, 60, index=1)
    except Exception:
        font_large = ImageFont.truetype(FONT_PATH, 300, index=0)
        font_sub = ImageFont.truetype(FONT_PATH, 60, index=0)

    bbox = draw.textbbox((0, 0), "ஆ", font=font_large)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    text_x = center[0] - w // 2 - bbox[0]
    text_y = center[1] - h // 2 - bbox[1] - 25

    draw.text((text_x + 4, text_y + 4), "ஆ", font=font_large, fill=(40, 8, 12, 220))
    draw.text((text_x, text_y), "ஆ", font=font_large, fill=gold)

    # Subtitle
    sub_text = "ஆத்திச்சூடி"
    sub_bbox = draw.textbbox((0, 0), sub_text, font=font_sub)
    sub_w = sub_bbox[2] - sub_bbox[0]
    draw.text((size // 2 - sub_w // 2, center[1] + radius + 40), sub_text, font=font_sub, fill=gold_soft)

    img.save('assets/icons/adaptive-icon.png', 'PNG')
    print("Created assets/icons/adaptive-icon.png")

def create_splash_icon():
    size = 1024
    img = Image.new('RGBA', (size, size), (253, 251, 247, 0)) # transparent background for splash icon
    draw = ImageDraw.Draw(img)

    gold = (212, 175, 55, 255)
    gold_soft = (235, 210, 120, 220)
    maroon_deep = (90, 18, 30, 255)
    maroon_text = (74, 14, 23, 255)

    center = (size // 2, size // 2 - 40)
    radius = 260
    draw.ellipse([center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius], 
                 fill=maroon_deep, outline=gold, width=10)
    
    r2 = radius - 18
    draw.ellipse([center[0] - r2, center[1] - r2, center[0] + r2, center[1] + r2], 
                 outline=gold_soft, width=3)

    try:
        font_large = ImageFont.truetype(FONT_PATH, 290, index=1)
        font_title = ImageFont.truetype(FONT_PATH, 80, index=1)
        font_sub = ImageFont.truetype(FONT_PATH, 42, index=0)
    except Exception:
        font_large = ImageFont.truetype(FONT_PATH, 290, index=0)
        font_title = ImageFont.truetype(FONT_PATH, 80, index=0)
        font_sub = ImageFont.truetype(FONT_PATH, 42, index=0)

    bbox = draw.textbbox((0, 0), "ஆ", font=font_large)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    text_x = center[0] - w // 2 - bbox[0]
    text_y = center[1] - h // 2 - bbox[1] - 25

    draw.text((text_x, text_y), "ஆ", font=font_large, fill=gold)

    # Title: ஆத்திச்சூடி
    title = "ஆத்திச்சூடி"
    tb = draw.textbbox((0, 0), title, font=font_title)
    tw = tb[2] - tb[0]
    draw.text((size // 2 - tw // 2, center[1] + radius + 50), title, font=font_title, fill=maroon_text)

    # Subtitle
    sub = "Tamil Wisdom for Every Day"
    sb = draw.textbbox((0, 0), sub, font=font_sub)
    sw = sb[2] - sb[0]
    draw.text((size // 2 - sw // 2, center[1] + radius + 150), sub, font=font_sub, fill=(110, 80, 50, 240))

    img.save('assets/splash/splash-icon.png', 'PNG')
    print("Created assets/splash/splash-icon.png")

def create_notification_icon():
    size = 96
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Simple white silhouette of 'ஆ' for Android notification status bar
    try:
        font = ImageFont.truetype(FONT_PATH, 70, index=1)
    except Exception:
        font = ImageFont.truetype(FONT_PATH, 70, index=0)

    bbox = draw.textbbox((0, 0), "ஆ", font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = (size - w) // 2 - bbox[0]
    y = (size - h) // 2 - bbox[1]

    draw.text((x, y), "ஆ", font=font, fill=(255, 255, 255, 255))
    img.save('assets/icons/notification-icon.png', 'PNG')
    print("Created assets/icons/notification-icon.png")

def create_favicon():
    size = 48
    img = Image.open('assets/icons/icon.png').resize((size, size), Image.Resampling.LANCZOS)
    img.save('assets/icons/favicon.png', 'PNG')
    print("Created assets/icons/favicon.png")

create_main_icon()
create_adaptive_icon()
create_splash_icon()
create_notification_icon()
create_favicon()
