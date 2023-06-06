from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY as _422
from starlette.status import HTTP_204_NO_CONTENT as _204
from starlette.status import HTTP_201_CREATED as _201
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from concurrent.futures import ThreadPoolExecutor
from fastapi.responses import JSONResponse
from starlette.requests import Request
from api.state import set_state, to_state
from fastapi import Depends, FastAPI
from pydantic import BaseModel
from util.models import HasBasicPage
from util.models import HasSurvey
from util.models import HasEvent
from api.service import to_service
from util import to_config
import requests
import asyncio
import json

# Construct API
nb_api = FastAPI()
nb_api.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

pool = ThreadPoolExecutor(max_workers=1)

# Handle common FastAPI exceptions
@nb_api.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    content = {'status_code': 10422, 'data': None}
    print(f'{exc}'.replace('\n', ' ').replace('   ', ' '))
    return JSONResponse(content=content, status_code=_422)

# Call Nationbuilder (or local mockup)
@nb_api.on_event("startup")
def startup_event():
    async def startup(config):
        requests.get(to_service(config).authorize_url)
    # Submit request in parallel
    pool.submit(asyncio.run, startup(to_config()))

'''
TODO: Documentation for Development
'''

@nb_api.get("/api")
def open_root_api(config=Depends(to_config)):
    oauth = to_service(config).oauth
    token = to_token()
    if token is None: return vars(config)
    return { **vars(config), "token": token }


'''
Authentication API
'''

def to_token():
    session = to_state("session")
    if session is None: return None
    return session.token

class HasCode(BaseModel):
    code: str

@nb_api.post("/api/redirect", status_code=_201)
async def handle_redirect(data: HasCode, config=Depends(to_config), status_code=_204):
    oauth = to_service(config).oauth
    async def get_token(**kwargs):
        token = oauth.get_access_token(**{
            "decoder": json.loads,
            "data": {
                **kwargs,
                "redirect_uri": config.redirect,
                "grant_type": "authorization_code"
            }
        })
        set_state('session', token=token)
    # Submit request in parallel
    pool.submit(asyncio.run, get_token(**vars(data)))


'''
Basic Page
'''

@nb_api.post("/api/basic_pages", status_code=_201)
async def create_basic_page(
        e: HasBasicPage, config=Depends(to_config), token=to_token()
    ):
    async def post_basic_page():
        url = '/sites/foobar-fake-site/pages/basic_pages'
        data = json.loads(e.json())
        await to_service(config).post_api(to_token(), url, data)
    # Submit request in parallel
    pool.submit(asyncio.run, post_basic_page())

@nb_api.get("/api/basic_pages")
def list_basic_pages(config=Depends(to_config), token=to_token()):
    url = '/sites/foobar-fake-site/pages/basic_pages'
    return to_service(config).get_api(to_token(), url)


'''
Survey
'''

@nb_api.post("/api/surveys", status_code=_201)
async def create_survey(
        e: HasSurvey, config=Depends(to_config), token=to_token()
    ):
    async def post_survey():
        url = '/sites/foobar-fake-site/pages/surveys'
        data = json.loads(e.json())
        await to_service(config).post_api(to_token(), url, data)
    # Submit request in parallel
    pool.submit(asyncio.run, post_survey())


@nb_api.get("/api/surveys")
def list_surveys(config=Depends(to_config), token=to_token()):
    url = '/sites/foobar-fake-site/pages/surveys'
    return to_service(config).get_api(to_token(), url)

'''
Event
'''

@nb_api.put("/api/pages/events/{ev}")
async def update_event(
        ev: int, e: HasEvent, config=Depends(to_config), token=to_token()
    ):
    async def put_event():
        url = f'/pages/events/{ev}'
        data = json.loads(e.json())
        await to_service(config).put_api(to_token(), url, data)
    # Submit request in parallel
    pool.submit(asyncio.run, put_event())

@nb_api.post("/api/pages/events", status_code=_201)
async def create_event(
        e: HasEvent, config=Depends(to_config), token=to_token()
    ):
    async def post_event():
        url = '/pages/events'
        data = json.loads(e.json())
        await to_service(config).post_api(to_token(), url, data)
    # Submit request in parallel
    pool.submit(asyncio.run, post_event())

@nb_api.get("/api/pages/events")
def list_events(config=Depends(to_config), token=to_token()):
    return to_service(config).get_api(to_token(), '/pages/events')
