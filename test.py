from argparse import ArgumentParser
from util import set_config
import asyncio
import uvicorn
import signal
import sys

PORTS = {
    "client": 8080,
    "mockup": 8888,
    "api": 8000
}

NATION = "greenrainbow"
API_PORT = PORTS['api']
MOCKUP_PORT = PORTS['mockup']
CLIENT_PORT = PORTS['client']

def to_help(label):
    if label == 'L': return 'local testing, without credentials'
    if label == 'URL': return 'custom live app redirect URL'
    return f'API Client {label} for "{NATION}"'

parser = ArgumentParser(
                    prog='Nationbuilder Certification',
                    description='Test of Nationbuilder API',
                    epilog=f'Using the "{NATION}" nation')
parser.add_argument('redirect', nargs='?', help=to_help('URL'))
parser.add_argument('client_id', nargs='?', help=to_help('ID'))
parser.add_argument('client_secret', nargs='?', help=to_help('Secret'))
parser.add_argument('-L', '--local', help=to_help('L'), action='store_true')

def to_server(port, module, scope):
    config = uvicorn.Config(**{
        "port": port,
        "reload": True,
        "host": "0.0.0.0",
        "app": f"{module}:{scope}_{module}"
    })
    return uvicorn.Server(config)


async def run_server(server):
    await server.serve()


async def run_tasks():

    loop = asyncio.get_event_loop()
    api_server = to_server(API_PORT, 'api', 'nb')
    mock_server = to_server(MOCKUP_PORT, 'mockup', 'nb')
    client_server = to_server(CLIENT_PORT, 'client', 'grp')
    api_task = asyncio.ensure_future(run_server(api_server))
    mock_task = asyncio.ensure_future(run_server(mock_server))
    client_task = asyncio.ensure_future(run_server(client_server))

    async def cancel():
        await api_server.shutdown()
        await mock_server.shutdown()
        await client_server.shutdown()
        sys.exit(0)

    tasks = [api_task, mock_task, client_task]
    # https://github.com/encode/uvicorn/pull/1600
    for job in asyncio.as_completed(tasks):
        try:
            results = await job
        finally:
            await cancel()

if __name__ == "__main__":

    local_redirect = f'http://localhost:{API_PORT}'
    args = parser.parse_args()
    args.protocol = "https://"
    # Allow local mockup testing
    if args.local:
        args.redirect = local_redirect
        args.client_secret = 'local'
        args.client_id = 'local'
        args.protocol = "http://"
    # Ensure redirect has protocol
    if args.redirect:
        if not args.redirect.startswith('http'):
            args.redirect = f'{protocol}{args.redirect}'
        args.redirect = f'{args.redirect}/api/redirect'
    # Configure API
    set_config(**{
        **vars(args), "ports": PORTS, "nation": NATION
    })

    # Test the API
    if not args.redirect: print(f'test.py -L to run without credentials, or see test.py -h')
    elif not args.client_id: print(f'Missing {to_help("ID")}')
    elif not args.client_secret: print(f'Missing {to_help("Secret")}')
    else:
        asyncio.run(run_tasks())
