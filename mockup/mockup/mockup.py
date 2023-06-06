from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY as _422
from starlette.status import HTTP_204_NO_CONTENT as _204
from starlette.status import HTTP_201_CREATED as _201
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.requests import Request
from mockup.state import set_state, to_state
from fastapi import FastAPI
from urllib.parse import parse_qs
import requests
import json

# Nationbuilder mockup API
nb_mockup = FastAPI()

# Handle common FastAPI exceptions
@nb_mockup.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    content = {'status_code': 10422, 'data': None}
    print(f'{exc}'.replace('\n', ' ').replace('   ', ' '))
    return JSONResponse(content=content, status_code=_422)

'''
Authentication API
'''

# "Ask a nation's administrator for access"
@nb_mockup.get("/mockup/oauth/authorize", status_code=_204)
def _authorize_url(redirect_uri):
    data = { 'code': 'mockup-123456789' }
    requests.post(redirect_uri, json=data)

# "Exchange the code for an access token"
@nb_mockup.post("/mockup/oauth/token")
async def _get_access_token(request: Request):
    qs = parse_qs((await request.body()).decode('utf-8'))
    access_token = '-'.join(['token', 'for'] + qs['code'])
    return { 'access_token': access_token }


'''
Basic Pages, mocked
'''

def to_basic_pages():
    basic_pages = to_state("basic_pages")
    if basic_pages is None: return []
    return basic_pages.basic_pages

@nb_mockup.get("/mockup/api/v1/sites/{site}/pages/basic_pages")
def _list_basic_pages(format: str, site: str):
    results = [e.basic_page for e in to_basic_pages()] 
    return { "results": results }

@nb_mockup.post("/mockup/api/v1/sites/{site}/pages/basic_pages", status_code=_201)
async def _create_basic_page(request: Request):
    basic_page = json.loads((await request.body()).decode('utf-8'))
    basic_pages = [e.dict() for e in to_basic_pages()]
    basic_page["basic_page"]["id"] = len(basic_pages)
    set_state('basic_pages', basic_pages=[basic_page, *basic_pages])


'''
Survey, mocked
'''

def to_surveys():
    surveys = to_state("surveys")
    if surveys is None: return []
    return surveys.surveys

@nb_mockup.post("/mockup/api/v1/sites/{site}/pages/surveys", status_code=_201)
async def _create_survey(request: Request):
    survey = json.loads((await request.body()).decode('utf-8'))
    surveys = [e.dict() for e in to_surveys()]
    survey["survey"]["id"] = len(surveys)
    set_state('surveys', surveys=[survey, *surveys])

@nb_mockup.get("/mockup/api/v1/sites/{site}/pages/surveys")
def _list_surveys(format: str):
    results = [e.survey for e in to_surveys()] 
    return { "results": results }


'''
Event, mocked
'''

def to_events():
    events = to_state("events")
    if events is None: return []
    return events.events

def update_ev(e, ev, event):
    if e["event"]["id"] == ev:
        e["event"].update(event["event"])
        return True
    return False

@nb_mockup.put("/mockup/api/v1/pages/events/{ev}", status_code=_201)
async def _update_event(ev: int, request: Request):
    event = json.loads((await request.body()).decode('utf-8'))
    event["event"].pop("id", None)
    events = [e.dict() for e in to_events()]
    next(e for e in events if update_ev(e, ev, event))
    set_state('events', events=events)

@nb_mockup.post("/mockup/api/v1/pages/events", status_code=_201)
async def _create_event(request: Request):
    event = json.loads((await request.body()).decode('utf-8'))
    events = [e.dict() for e in to_events()]
    event["event"]["id"] = len(events)
    set_state('events', events=[event, *events])

@nb_mockup.get("/mockup/api/v1/pages/events")
def _list_events(format: str):
    results = [e.event for e in to_events()] 
    return { "results": results }
