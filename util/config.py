from pydantic import BaseSettings
from pydantic import BaseModel
from functools import lru_cache
import json

CONFIG = 'env.json'

@lru_cache()
def to_config():
    with open(CONFIG, 'r') as f:
        return Config(**json.loads(f.read()))

def set_config(**kwargs):
    with open(CONFIG, 'w') as f:
        f.write(json.dumps(kwargs)) 

class Ports(BaseModel):
    client: int
    mockup: int
    api: int

class Config(BaseSettings):
    ports: Ports
    local: bool
    nation: str
    protocol: str
    redirect: str
    api_url: str
    base_url: str
    client_id: str
    client_secret: str
    authorize_url: str
    access_token_url: str
    def __init__(self, **kwargs):
        protocol = kwargs["protocol"]
        base_url = self.to_base_url(**kwargs)
        api_url = f"{protocol}{base_url}/api/v1"
        oauth_url = f"{protocol}{base_url}/oauth"
        kwargs["authorize_url"] = f"{oauth_url}/authorize"
        kwargs["access_token_url"] = f"{oauth_url}/token"
        kwargs["base_url"] = base_url 
        kwargs["api_url"] = api_url 
        super().__init__(**kwargs)

    def to_base_url(self, **kwargs):
        mockup_port = kwargs["ports"]["mockup"]
        if kwargs['local']: return f"localhost:{mockup_port}/mockup"
        return f"{kwargs['nation']}.nationbuilder.com"
