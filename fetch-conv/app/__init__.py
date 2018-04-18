# Import flask and template operators
from flask import Flask, Response
from pymongo import MongoClient
from flask_cors import CORS
import json

# Define the WSGI application object
app = Flask(__name__, static_url_path='')
# Configurations
app.config.from_object('config')
CORS(app, supports_credentials=True)

host = 'https://slack.com'

generated_client_id = '3297565907.340417399520'
generated_client_secret = '9e6636592dea727123bceda1e59a2190'

client_id = 'client_id=' + generated_client_id
client_secret = 'client_secret=' + generated_client_secret

# SET UP DB
# client = MongoClient("mongodb://kay:myRealPassword@mycluster0-shard-00-00.mongodb.net:27017,mycluster0-shard-00-01.mongodb.net:27017,mycluster0-shard-00-02.mongodb.net:27017/admin?ssl=true&replicaSet=Mycluster0-shard-0&authSource=admin")
# db = client.test
client = MongoClient('mongodb://localhost:27017/')
db = client['fetch-conv']

@app.route('/', methods=['GET'])
def renderPage():
    return app.send_static_file('index.html')


# Sample HTTP error handling
@app.errorhandler(404)
def not_found(error):
    return Response(
        json.dumps({
            'message': 'Not found'
        }, indent=4, sort_keys=True),
        status=404,
        content_type='application/json'
    )

# Import a module / component using its blueprint handler variable (mod_auth)
from app.mod_auth.controllers import mod_auth as auth_module
from app.channel_miner.controllers import channel_miner as channel_module

# Register blueprint(s)
app.register_blueprint(auth_module)
app.register_blueprint(channel_module)
# app.register_blueprint(xyz_module)
# ..
