from typing import List, Optional
from pydantic import BaseModel


class Choice(BaseModel):
    name: str


class Question(BaseModel):
    prompt: str
    slug: str
    type: str
    status: str
    choices: List[Choice]


class Survey(BaseModel):
    slug: str
    name: str
    status: str
    tags: List[str]
    id: Optional[int]
    questions: List[Question]


class HasSurvey(BaseModel):
    survey: Survey
