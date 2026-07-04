import sys
import cv2
import numpy as np
from rembg import remove

def remove_background(input_path, output_path):
    try:
        # We use rembg (which uses ONNX/OpenCV under the hood) for high-quality removal
        # Read the image using cv2 to ensure it's valid
        img = cv2.imread(input_path)
        if img is None:
            print("Error: Could not read image.")
            sys.exit(1)
            
        with open(input_path, 'rb') as i:
            with open(output_path, 'wb') as o:
                input_data = i.read()
                output_data = remove(input_data)
                o.write(output_data)
                
        print("Success")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python remove_bg.py <input_path> <output_path>")
        sys.exit(1)
    remove_background(sys.argv[1], sys.argv[2])
