from pydantic import BaseSettings
from typing import Dict, List
from util.models import HasBasicPage
from util.models import HasSurvey
from util.models import HasEvent
from threading import Lock
from pathlib import Path
import json
import os

class BasicPages(BaseSettings):
    basic_pages: List[HasBasicPage]

class Surveys(BaseSettings):
    surveys: List[HasSurvey]

class Events(BaseSettings):
    events: List[HasEvent]

TYPES = {
    "events": Events,
    "surveys": Surveys,
    "basic_pages": BasicPages
}
LOCKS = { k: Lock() for k in TYPES.keys() }
DIR = Path(__file__).parent.resolve()

def to_file(key):
    return DIR.joinpath(f'{key}.json')

def to_lock(key):
    return LOCKS[key]

def to_state(key):
    filename = to_file(key)
    if not os.path.exists(filename):
        return None
    with open(filename, 'r') as f:
        try:
            return TYPES[key](**json.loads(f.read()))
        except json.JSONDecodeError:
            return TYPES[key](events=[])

def set_state(key, **kwargs):
    lock = to_lock(key)
    lock.acquire()
    with open(to_file(key), 'w') as f:
        f.write(json.dumps(kwargs)) 
    lock.release()
