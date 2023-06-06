from starlette.responses import FileResponse 
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI

# Mockup nationbuilder server
grp_client = FastAPI()

'''
Client-side single page app
'''

@grp_client.get("/")
async def open_root_html():
    return FileResponse('client/index.html')

grp_client.mount("/src", StaticFiles(directory="client/src"), name="src")
grp_client.mount("/data", StaticFiles(directory="client/data"), name="data")
