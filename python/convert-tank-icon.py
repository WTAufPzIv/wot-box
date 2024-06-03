import os

def rename_files():
    # 获取当前目录
    current_dir = os.getcwd()
    
    # 遍历当前目录下的所有文件
    for filename in os.listdir(current_dir):
        # 检查文件是否是 .png 文件
        if filename.endswith('.png'):
            # 查找第一个 '-' 的位置
            first_dash_index = filename.find('-')
            if first_dash_index != -1:
                # 提取 {xxx2} 部分并将文件名改为小写
                new_name = filename[first_dash_index + 1:].lower()
                # 获取文件的完整路径
                old_file = os.path.join(current_dir, filename)
                new_file = os.path.join(current_dir, new_name)
                # 重命名文件
                os.rename(old_file, new_file)
                print(f'Renamed: {filename} -> {new_name}')

if __name__ == '__main__':
    rename_files()