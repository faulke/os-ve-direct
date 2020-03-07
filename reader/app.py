import asyncio, multiprocessing, websockets
from vedirect import Vedirect

# check if data is available in queue, then send to ws client
async def check_queue(client):
    while True:
        if not queue.empty() and client.open:
            message = queue.get()
            await client.send(message)
        await asyncio.sleep(1)

# websocket handler
async def websocket(client, path):
    await check_queue(client)

# init data queue for vedirect service
queue = multiprocessing.Queue(maxsize=1)

# start ws server
start_server = websockets.serve(websocket, "0.0.0.0", 8765)

# start vedirect service in background
ve = Vedirect("/dev/ttyUSB0", 60, queue)
ve.daemon = True
ve.start()

loop = asyncio.get_event_loop()

# run everything
loop.run_until_complete(start_server)
loop.run_forever()
