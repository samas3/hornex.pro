import requests
import zipfile
import os
latest = requests.get('https://api.github.com/repos/samas3/hornex.pro/releases/latest').json()
tag_name = latest.get('tag_name', 'release')
if tag_name != 'release':
    tag_name = tag_name.split('.')
    tag_name[-1] = str(int(tag_name[-1]) + 1)
    tag_name = '.'.join(tag_name)
print(tag_name)
# 将目录下的文件打包
z = zipfile.ZipFile(tag_name + '.zip', 'w')
for f in os.listdir('.'):
    if '.zip' in f or '.py' in f:
        continue
    z.write(f)
z.close()