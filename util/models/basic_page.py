from pydantic import BaseModel
from typing import Optional

class BasicPage(BaseModel):
    name: str
    id: Optional[int]
    content: str
    status: str

class HasBasicPage(BaseModel):
    basic_page: BasicPage
