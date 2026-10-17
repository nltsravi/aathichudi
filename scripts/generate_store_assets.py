import os
import subprocess
import time
from PIL import Image, ImageDraw, ImageFont, ImageFilter

os.makedirs('assets/store', exist_ok=True)
os.makedirs('assets/store/phone', exist_ok=True)
os.makedirs('assets/store/tablet-7inch', exist_ok=True)
os.makedirs('assets/store/tablet-10inch', exist_ok=True)
os.makedirs('scratch/screens', exist_ok=True)

TAMIL_FONT_PATH = '/System/Library/Fonts/Supplemental/Tamil Sangam MN.ttc'
TAMIL_BOLD_FONT = '/System/Library/Fonts/Supplemental/Tamil MN.ttc'
ENGLISH_FONT_PATH = '/System/Library/Fonts/Helvetica.ttc'
CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

def get_font(path, size, index=0):
    try:
        return ImageFont.truetype(path, size, index=index)
    except Exception:
        try:
            return ImageFont.truetype(TAMIL_FONT_PATH, size, index=0)
        except Exception:
            return ImageFont.load_default()

def create_store_icon():
    """Google Play Store Icon: 512 x 512 px 32-bit PNG"""
    src_icon = 'assets/icons/icon.png'
    if os.path.exists(src_icon):
        im = Image.open(src_icon).convert('RGBA')
        im_512 = im.resize((512, 512), Image.Resampling.LANCZOS)
        im_512.save('assets/store/icon-512.png', 'PNG')
        print("Generated assets/store/icon-512.png (512x512)")

def create_feature_graphic():
    """Google Play Store Feature Graphic: 1024 x 500 px (no alpha, RGB)"""
    width = 1024
    height = 500
    
    img = Image.new('RGB', (width, height), (55, 9, 16))
    draw = ImageDraw.Draw(img)
    
    # Subtle gradient background
    for y in range(height):
        for x in range(0, width, 4):
            dx = (x - width * 0.45) / (width * 0.6)
            dy = (y - height * 0.5) / (height * 0.5)
            dist = (dx * dx + dy * dy) ** 0.5
            factor = max(0.0, min(1.0, dist))
            
            r = int(95 * (1 - factor * 0.55))
            g = int(20 * (1 - factor * 0.65))
            b = int(32 * (1 - factor * 0.60))
            draw.rectangle([x, y, x + 3, y], fill=(r, g, b))
            
    margin = 22
    gold = (212, 175, 55)
    gold_soft = (235, 210, 120)
    gold_dim = (140, 110, 35)
    
    draw.rounded_rectangle([margin, margin, width - margin, height - margin], radius=20, outline=gold, width=4)
    draw.rounded_rectangle([margin + 8, margin + 8, width - margin - 8, height - margin - 8], radius=16, outline=gold_dim, width=1)
    
    corner_len = 36
    for cx, cy, sx, sy in [(margin, margin, 1, 1), 
                           (width - margin, margin, -1, 1), 
                           (margin, height - margin, 1, -1), 
                           (width - margin, height - margin, -1, -1)]:
        draw.line([cx, cy, cx + sx * corner_len, cy], fill=gold_soft, width=4)
        draw.line([cx, cy, cx, cy + sy * corner_len], fill=gold_soft, width=4)
        dx_c = cx + sx * 16
        dy_c = cy + sy * 16
        draw.polygon([(dx_c, dy_c - 6), (dx_c + 6, dy_c), (dx_c, dy_c + 6), (dx_c - 6, dy_c)], fill=gold)

    icon_size = 280
    icon_x = 90
    icon_y = (height - icon_size) // 2
    
    shadow_offset = 12
    draw.rounded_rectangle([icon_x + shadow_offset, icon_y + shadow_offset, 
                            icon_x + icon_size + shadow_offset, icon_y + icon_size + shadow_offset], 
                           radius=56, fill=(20, 3, 6))
    
    if os.path.exists('assets/icons/icon.png'):
        icon_img = Image.open('assets/icons/icon.png').convert('RGBA')
        icon_resized = icon_img.resize((icon_size, icon_size), Image.Resampling.LANCZOS)
        mask = Image.new('L', (icon_size, icon_size), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.rounded_rectangle([0, 0, icon_size, icon_size], radius=56, fill=255)
        img.paste(icon_resized, (icon_x, icon_y), mask)
        draw.rounded_rectangle([icon_x, icon_y, icon_x + icon_size, icon_y + icon_size], radius=56, outline=gold, width=4)

    text_start_x = icon_x + icon_size + 60
    
    font_tamil_title = get_font(TAMIL_BOLD_FONT, 76, index=1)
    font_tamil_sub = get_font(TAMIL_FONT_PATH, 24, index=1)
    font_eng_title = get_font(ENGLISH_FONT_PATH, 26, index=1)
    font_badge = get_font(TAMIL_FONT_PATH, 16, index=1)
    
    title_y = 78
    draw.text((text_start_x + 3, title_y + 3), "ஆத்திச்சூடி", font=font_tamil_title, fill=(25, 4, 8))
    draw.text((text_start_x, title_y), "ஆத்திச்சூடி", font=font_tamil_title, fill=gold_soft)
    
    eng_y = title_y + 90
    draw.text((text_start_x + 2, eng_y), "AATHICHUDI — TAMIL WISDOM", font=font_eng_title, fill=(245, 230, 200))
    
    tag_y = eng_y + 44
    tagline = "ஔவையார் & மகாகவி பாரதியாரின் ஆத்திச்சூடி"
    draw.text((text_start_x, tag_y), tagline, font=font_tamil_sub, fill=(230, 215, 195))
    
    tagline2 = "முழுமையான ஆஃப்லைன் நீதி நூல் இலக்கியச் செயலி"
    draw.text((text_start_x, tag_y + 36), tagline2, font=font_tamil_sub, fill=gold)
    
    badges_y = tag_y + 88
    badges = [
        ("100% ஆஃப்லைன்", 145),
        ("விளம்பரங்கள் இல்லை", 175),
        ("219+ பாடல்கள்", 140)
    ]
    
    bx = text_start_x
    for badge_text, bw in badges:
        bh = 34
        draw.rounded_rectangle([bx, badges_y, bx + bw, badges_y + bh], radius=17, fill=(80, 16, 26), outline=gold, width=2)
        tb = draw.textbbox((0, 0), badge_text, font=font_badge)
        tw = tb[2] - tb[0]
        th = tb[3] - tb[1]
        draw.text((bx + (bw - tw) // 2, badges_y + (bh - th) // 2 - 2), badge_text, font=font_badge, fill=(255, 248, 235))
        bx += bw + 14
        
    img.save('assets/store/feature-graphic.png', 'PNG')
    print("Generated assets/store/feature-graphic.png (1024x500)")

def capture_url(url, out_path, width=430, height=932, scale=2):
    """Capture URL using headless Chrome with retina resolution"""
    cmd = [
        CHROME_BIN,
        '--headless=new',
        '--disable-gpu',
        '--run-all-compositor-stages-before-draw',
        '--virtual-time-budget=6000',
        f'--force-device-scale-factor={scale}',
        f'--window-size={width},{height}',
        f'--screenshot={out_path}',
        url
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.exists(out_path):
        print(f"Captured {url} -> {out_path}")
        return True
    return False

def make_device_mockup(screen_img_path, target_screen_w=820, target_screen_h=1680):
    """Wrap screen capture into a sleek modern smartphone frame with shadow"""
    screen = Image.open(screen_img_path).convert('RGBA')
    screen = screen.resize((target_screen_w, target_screen_h), Image.Resampling.LANCZOS)
    
    # Bezel specifications: sleek top & bottom bezel
    bezel_thickness = 26
    frame_w = target_screen_w + bezel_thickness * 2
    frame_h = target_screen_h + bezel_thickness * 2
    corner_radius = 54
    screen_radius = 40
    
    # Device frame canvas
    device = Image.new('RGBA', (frame_w, frame_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(device)
    
    # Outer dark titanium bezel
    draw.rounded_rectangle([0, 0, frame_w, frame_h], radius=corner_radius, fill=(22, 18, 20, 255), outline=(85, 70, 74, 255), width=3)
    draw.rounded_rectangle([2, 2, frame_w - 2, frame_h - 2], radius=corner_radius - 2, outline=(40, 32, 35, 255), width=2)
    
    # Screen with rounded corners
    screen_mask = Image.new('L', (target_screen_w, target_screen_h), 0)
    mask_draw = ImageDraw.Draw(screen_mask)
    mask_draw.rounded_rectangle([0, 0, target_screen_w, target_screen_h], radius=screen_radius, fill=255)
    
    device.paste(screen, (bezel_thickness, bezel_thickness), screen_mask)
    
    # Subtle inner gold rim around screen
    draw.rounded_rectangle([bezel_thickness, bezel_thickness, bezel_thickness + target_screen_w, bezel_thickness + target_screen_h], 
                           radius=screen_radius, outline=(180, 140, 50, 70), width=2)
    
    # Speaker grill & pinhole camera in the top bezel (never touches the screen contents)
    earpiece_w = 90
    earpiece_h = 4
    earpiece_y = bezel_thickness // 2 - 2
    draw.rounded_rectangle([(frame_w - earpiece_w) // 2, earpiece_y, (frame_w + earpiece_w) // 2, earpiece_y + earpiece_h], radius=2, fill=(45, 38, 40, 255))
    
    camera_cx = (frame_w - earpiece_w) // 2 - 20
    camera_cy = bezel_thickness // 2
    camera_r = 4
    draw.ellipse([camera_cx - camera_r, camera_cy - camera_r, camera_cx + camera_r, camera_cy + camera_r], fill=(12, 10, 15, 255))
    
    # Bottom home navigation bar indicator
    bar_w = 220
    bar_h = 6
    bar_y = frame_h - bezel_thickness - 16
    draw.rounded_rectangle([(frame_w - bar_w) // 2, bar_y, (frame_w + bar_w) // 2, bar_y + bar_h], radius=3, fill=(160, 140, 130, 180))
    
    # Add deep soft drop shadow
    shadow_padding = 50
    shadow_w = frame_w + shadow_padding * 2
    shadow_h = frame_h + shadow_padding * 2
    shadow_layer = Image.new('RGBA', (shadow_w, shadow_h), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_layer)
    shadow_draw.rounded_rectangle([shadow_padding + 6, shadow_padding + 18, 
                                   shadow_padding + frame_w - 6, shadow_padding + frame_h + 18], 
                                  radius=corner_radius + 4, fill=(0, 0, 0, 140))
    shadow_blurred = shadow_layer.filter(ImageFilter.GaussianBlur(radius=28))
    
    # Composite device onto shadow
    shadow_blurred.paste(device, (shadow_padding, shadow_padding), device)
    return shadow_blurred

def create_phone_screenshot(index, tag_text, title_ta, subtitle_en, screen_capture_path, out_path):
    """Generate high-resolution 1080 x 2400 phone promotional screenshot"""
    canvas_w = 1080
    canvas_h = 2400
    
    # Rich heritage gradient: deep wine / maroon
    canvas = Image.new('RGB', (canvas_w, canvas_h), (65, 12, 20))
    draw = ImageDraw.Draw(canvas)
    
    for y in range(0, canvas_h, 6):
        fy = y / canvas_h
        r = int(85 * (1 - fy * 0.45))
        g = int(16 * (1 - fy * 0.55))
        b = int(26 * (1 - fy * 0.50))
        draw.rectangle([0, y, canvas_w, y + 5], fill=(r, g, b))
        
    gold = (212, 175, 55)
    gold_soft = (240, 220, 150)
    gold_dim = (140, 110, 40)
    
    # Outer luxury decorative border
    margin = 32
    draw.rounded_rectangle([margin, margin, canvas_w - margin, canvas_h - margin], radius=32, outline=gold, width=4)
    draw.rounded_rectangle([margin + 12, margin + 12, canvas_w - margin - 12, canvas_h - margin - 12], radius=24, outline=gold_dim, width=2)
    
    # Corner diamonds
    for cx, cy in [(margin + 20, margin + 20), 
                   (canvas_w - margin - 20, margin + 20),
                   (margin + 20, canvas_h - margin - 20),
                   (canvas_w - margin - 20, canvas_h - margin - 20)]:
        draw.polygon([(cx, cy - 8), (cx + 8, cy), (cx, cy + 8), (cx - 8, cy)], fill=gold)

    # Top Brand Header
    font_brand = get_font(TAMIL_BOLD_FONT, 32, index=1)
    brand_text = "ஆத்திச்சூடி • AATHICHUDI"
    tb = draw.textbbox((0, 0), brand_text, font=font_brand)
    bw = tb[2] - tb[0]
    draw.text(((canvas_w - bw) // 2, 85), brand_text, font=font_brand, fill=gold_soft)

    # Category Pill Badge
    font_badge = get_font(TAMIL_FONT_PATH, 24, index=1)
    badge_tb = draw.textbbox((0, 0), tag_text, font=font_badge)
    badge_w = badge_tb[2] - badge_tb[0] + 48
    badge_h = 48
    badge_x = (canvas_w - badge_w) // 2
    badge_y = 150
    draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=24, fill=(95, 20, 32), outline=gold, width=2)
    draw.text((badge_x + 24, badge_y + 10), tag_text, font=font_badge, fill=(255, 248, 235))

    # Main Tamil Title
    font_title = get_font(TAMIL_BOLD_FONT, 64, index=1)
    title_tb = draw.textbbox((0, 0), title_ta, font=font_title)
    title_w = title_tb[2] - title_tb[0]
    title_y = 230
    draw.text(((canvas_w - title_w) // 2 + 3, title_y + 3), title_ta, font=font_title, fill=(20, 3, 6))
    draw.text(((canvas_w - title_w) // 2, title_y), title_ta, font=font_title, fill=gold_soft)

    # English Subtitle
    font_sub = get_font(ENGLISH_FONT_PATH, 34, index=1)
    sub_tb = draw.textbbox((0, 0), subtitle_en, font=font_sub)
    sub_w = sub_tb[2] - sub_tb[0]
    sub_y = title_y + 92
    draw.text(((canvas_w - sub_w) // 2, sub_y), subtitle_en, font=font_sub, fill=(245, 230, 210))

    # Decorative lotus ornament divider
    div_y = sub_y + 60
    div_w = 340
    div_x1 = (canvas_w - div_w) // 2
    div_x2 = div_x1 + div_w
    draw.line([div_x1, div_y, div_x1 + 130, div_y], fill=gold_dim, width=2)
    draw.line([div_x2 - 130, div_y, div_x2, div_y], fill=gold_dim, width=2)
    # Center diamond
    draw.polygon([(canvas_w // 2, div_y - 7), (canvas_w // 2 + 7, div_y), (canvas_w // 2, div_y + 7), (canvas_w // 2 - 7, div_y)], fill=gold)

    # Build and position Phone Mockup
    mockup = make_device_mockup(screen_capture_path, target_screen_w=820, target_screen_h=1760)
    mock_x = (canvas_w - mockup.width) // 2
    mock_y = div_y + 25
    
    canvas.paste(mockup, (mock_x, mock_y), mockup)
    canvas.save(out_path, 'PNG')
    print(f"Generated {out_path} (1080x2400)")

def create_tablet_screenshots():
    """Create 7-inch (1200x1920) and 10-inch (1600x2560) screenshots"""
    # 7-inch tablet: 1200 x 1920
    t7_w = 1200
    t7_h = 1920
    t7 = Image.new('RGB', (t7_w, t7_h), (65, 12, 20))
    draw = ImageDraw.Draw(t7)
    
    # Outer border
    gold = (212, 175, 55)
    draw.rounded_rectangle([30, 30, t7_w - 30, t7_h - 30], radius=28, outline=gold, width=4)
    
    font_title = get_font(TAMIL_BOLD_FONT, 64, index=1)
    font_sub = get_font(ENGLISH_FONT_PATH, 32, index=1)
    
    t_text = "ஆத்திச்சூடி — தமிழ் வாழ்வியல் நீதி"
    tb = draw.textbbox((0, 0), t_text, font=font_title)
    draw.text(((t7_w - (tb[2]-tb[0])) // 2, 70), t_text, font=font_title, fill=(240, 220, 150))
    
    s_text = "Avvaiyar & Bharathiyar • Complete 100% Offline App"
    sb = draw.textbbox((0, 0), s_text, font=font_sub)
    draw.text(((t7_w - (sb[2]-sb[0])) // 2, 150), s_text, font=font_sub, fill=(240, 230, 215))
    
    # Tablet device frame
    t_screen_path = 'scratch/screens/screen1_home.png'
    if os.path.exists(t_screen_path):
        mockup = make_device_mockup(t_screen_path, target_screen_w=940, target_screen_h=1520)
        t7.paste(mockup, ((t7_w - mockup.width) // 2, 220), mockup)
        t7.save('assets/store/tablet-7inch/tablet7_home.png', 'PNG')
        print("Generated assets/store/tablet-7inch/tablet7_home.png (1200x1920)")

    # 10-inch tablet: 1600 x 2560
    t10_w = 1600
    t10_h = 2560
    t10 = Image.new('RGB', (t10_w, t10_h), (65, 12, 20))
    draw10 = ImageDraw.Draw(t10)
    draw10.rounded_rectangle([40, 40, t10_w - 40, t10_h - 40], radius=36, outline=gold, width=6)
    
    font_title10 = get_font(TAMIL_BOLD_FONT, 82, index=1)
    font_sub10 = get_font(ENGLISH_FONT_PATH, 42, index=1)
    
    t_text10 = "சொல்லுக்குச் சொல் பொருள் & விளக்கம்"
    tb10 = draw10.textbbox((0, 0), t_text10, font=font_title10)
    draw10.text(((t10_w - (tb10[2]-tb10[0])) // 2, 90), t_text10, font=font_title10, fill=(240, 220, 150))
    
    s_text10 = "Deep Literary Meanings, Paraphrase & English Translation"
    sb10 = draw10.textbbox((0, 0), s_text10, font=font_sub10)
    draw10.text(((t10_w - (sb10[2]-sb10[0])) // 2, 195), s_text10, font=font_sub10, fill=(240, 230, 215))
    
    t_screen_path2 = 'scratch/screens/screen2_verse.png'
    if os.path.exists(t_screen_path2):
        mockup10 = make_device_mockup(t_screen_path2, target_screen_w=1260, target_screen_h=2050)
        t10.paste(mockup10, ((t10_w - mockup10.width) // 2, 290), mockup10)
        t10.save('assets/store/tablet-10inch/tablet10_verse.png', 'PNG')
        print("Generated assets/store/tablet-10inch/tablet10_verse.png (1600x2560)")

def main():
    print("=== Generating Google Play Store Assets ===")
    create_store_icon()
    create_feature_graphic()
    
    # 1. Capture screens
    screens = [
        ("http://localhost:8086/", "scratch/screens/screen1_home.png"),
        ("http://localhost:8086/verse/avvaiyar/1", "scratch/screens/screen2_verse.png"),
        ("http://localhost:8086/poet/avvaiyar", "scratch/screens/screen3_poet.png"),
        ("http://localhost:8086/daily-verse", "scratch/screens/screen4_daily.png"),
        ("http://localhost:8086/search", "scratch/screens/screen5_search.png"),
        ("http://localhost:8086/verse/bharathiyar/1", "scratch/screens/screen6_bharathiyar.png"),
    ]
    
    for url, path in screens:
        capture_url(url, path, width=430, height=932, scale=2)
        time.sleep(1)
        
    # 2. Build 6 promotional phone screenshots (1080 x 2400)
    phone_configs = [
        (1, "100% ஆஃப்லைன் • விளம்பரங்கள் இல்லை", "தினமும் ஒரு வாழ்வியல் நீதி", "Daily Tamil Wisdom & Invocations", "scratch/screens/screen1_home.png", "assets/store/phone/screenshot_1_home.png"),
        (2, "சொல்லுக்குச் சொல் பொருள் & விளக்கம்", "அறஞ்செய விரும்பு", "Deep Meaning, Paraphrase & English Translation", "scratch/screens/screen2_verse.png", "assets/store/phone/screenshot_2_verse_reader.png"),
        (3, "219+ முழுமையான பாடல்கள்", "இரு பெரும் ஆத்திச்சூடி நூல்கள்", "Avvaiyar & Bharathiyar with Invocations", "scratch/screens/screen3_poet.png", "assets/store/phone/screenshot_3_poet_collection.png"),
        (4, "WhatsApp Status & Story கார்டுகள்", "அழகிய பகிர்வு அட்டைகள்", "Create & Share Aesthetic Social Cards", "scratch/screens/screen4_daily.png", "assets/store/phone/screenshot_4_status_card.png"),
        (5, "நொடிப் பொழுதில் அதிவேகத் தேடல்", "முழுமையான ஆஃப்லைன் தேடல்", "Instant Search by Words, Meanings, or Numbers", "scratch/screens/screen5_search.png", "assets/store/phone/screenshot_5_search.png"),
        (6, "மகாகவி பாரதியார் புதிய ஆத்திச்சூடி", "அச்சம் தவிர் — புரட்சி நெறி", "Modern Inspirational Wisdom for Youth & Children", "scratch/screens/screen6_bharathiyar.png", "assets/store/phone/screenshot_6_bharathiyar.png"),
    ]
    
    for idx, tag, title, sub, sc_path, out in phone_configs:
        create_phone_screenshot(idx, tag, title, sub, sc_path, out)
        
    # 3. Build tablet screenshots
    create_tablet_screenshots()
    print("=== All Store Assets Successfully Generated! ===")

if __name__ == '__main__':
    main()
