import os

def rename_files(directory):
    files = os.listdir(directory)
    files.sort()
    
    for i, filename in enumerate(files):
        if filename.endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
            new_name = f"image_{i+1:03d}{os.path.splitext(filename)[1]}"
            os.rename(os.path.join(directory, filename), os.path.join(directory, new_name))
            print(f"Renamed {filename} to {new_name}")

directory = r"C:\Users\daban\Documents\ubuntu\Screenshot"
rename_files(directory)