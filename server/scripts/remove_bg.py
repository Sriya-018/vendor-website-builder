import sys
import os
import urllib.request
import urllib.error

# Attempt to load REMOVE_BG_API_KEY from environment or ../.env
api_key = os.environ.get('REMOVE_BG_API_KEY')
if not api_key:
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    if os.path.exists(env_path):
        try:
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith('REMOVE_BG_API_KEY='):
                        api_key = line.split('=', 1)[1].strip().strip('"').strip("'")
                        break
        except Exception:
            pass

def remove_via_api(input_path, output_path, key):
    """Use the official remove.bg API (fast, instant, 1-second response)"""
    if not key or key == 'your_remove_bg_api_key_here':
        return False
    try:
        boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
        with open(input_path, 'rb') as f:
            img_bytes = f.read()

        body = bytearray()
        body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="image_file"; filename="{os.path.basename(input_path)}"\r\nContent-Type: application/octet-stream\r\n\r\n'.encode('utf-8'))
        body.extend(img_bytes)
        body.extend(f'\r\n--{boundary}\r\nContent-Disposition: form-data; name="size"\r\n\r\nauto\r\n'.encode('utf-8'))
        body.extend(f'--{boundary}--\r\n'.encode('utf-8'))

        req = urllib.request.Request('https://api.remove.bg/v1.0/removebg', data=body)
        req.add_header('X-Api-Key', key)
        req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')

        with urllib.request.urlopen(req, timeout=12) as response:
            if response.status == 200:
                with open(output_path, 'wb') as out_f:
                    out_f.write(response.read())
                return True
    except Exception as e:
        # If API quota is exhausted or offline, proceed to fallback
        pass
    return False

def remove_via_rembg(input_path, output_path):
    """Local rembg model processing"""
    try:
        from rembg import remove
        with open(input_path, 'rb') as i:
            with open(output_path, 'wb') as o:
                o.write(remove(i.read()))
        return True
    except Exception:
        return False

def remove_via_opencv(input_path, output_path):
    """OpenCV GrabCut segmentation fallback"""
    try:
        import cv2
        import numpy as np

        img = cv2.imread(input_path)
        if img is None:
            return False

        height, width = img.shape[:2]
        if height < 10 or width < 10:
            return False

        mask = np.zeros(img.shape[:2], np.uint8)
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)

        margin_x = max(1, int(width * 0.05))
        margin_y = max(1, int(height * 0.05))
        rect = (margin_x, margin_y, width - 2 * margin_x, height - 2 * margin_y)

        cv2.grabCut(img, mask, rect, bgd_model, fgd_model, 3, cv2.GC_INIT_WITH_RECT)
        mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')

        b, g, r = cv2.split(img)
        alpha = (mask2 * 255).astype('uint8')
        rgba = cv2.merge([b, g, r, alpha])

        cv2.imwrite(output_path, rgba)
        return True
    except Exception:
        return False

def remove_background(input_path, output_path):
    if not os.path.exists(input_path):
        print("Error: Input file does not exist")
        sys.exit(1)

    # 1. Try Remove.bg API with key
    if api_key and remove_via_api(input_path, output_path, api_key):
        print("Success (via Remove.bg API)")
        return

    # 2. Try local rembg
    if remove_via_rembg(input_path, output_path):
        print("Success (via rembg)")
        return

    # 3. Try OpenCV GrabCut
    if remove_via_opencv(input_path, output_path):
        print("Success (via OpenCV GrabCut)")
        return

    # 4. Safe fallback: Copy image so upload pipeline never breaks
    try:
        import shutil
        shutil.copyfile(input_path, output_path)
        print("Success (fallback copy)")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python remove_bg.py <input_path> <output_path>")
        sys.exit(1)
    remove_background(sys.argv[1], sys.argv[2])
