import socketio

# Create the Async Socket.IO server
# cors_allowed_origins='*' allows your friend's frontend to connect from any port during dev
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
