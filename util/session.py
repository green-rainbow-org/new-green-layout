from rauth import OAuth2Service

class Session():
    def __init__(self, config, service):
        self.authorize_url = service.get_authorize_url(**{
            "redirect_uri": config.redirect,
            "response_type": "code"
        })
        self.oauth = service

def to_session(config):
    service = OAuth2Service(
            name = config.nation,
            base_url = config.base_url,
            client_id = config.client_id,
            client_secret = config.client_secret,
            authorize_url = config.authorize_url,
            access_token_url = config.access_token_url)

    token = to_state('session').token
    return service.get_session(token)
